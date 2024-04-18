# Movable Type (r) (C) 2001-2019 Six Apart, Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.
#
# $Id$

package FacebookCommenters::Auth;
use strict;
use warnings;

use MT::Util qw( asset_from_url );

my $PluginKey = 'FacebookCommenters';

sub password_exists {0}

sub instance {
    my ($app) = @_;
    $app ||= 'MT';
    $app->component($PluginKey);
}

sub condition {
    my ( $blog, $reason ) = @_;
    return 1 unless $blog;
    my $plugin  = instance();
    my $blog_id = $blog->id;
    my $facebook_api_key
        = $plugin->get_config_value( 'facebook_app_key', "blog:$blog_id" );
    my $facebook_api_secret
        = $plugin->get_config_value( 'facebook_app_secret', "blog:$blog_id" );
    return 1 if $facebook_api_key && $facebook_api_secret;
    $$reason
        = '<a href="?__mode=cfg_plugins&amp;blog_id='
        . $blog->id . '">'
        . $plugin->translate('Set up Facebook Commenters plugin') . '</a>';
    return 0;
}

sub commenter_auth_params {
    my ( $key, $blog_id, $entry_id, $static ) = @_;
    require MT::Util;
    if ( $static =~ m/^https?%3A%2F%2F/ ) {

        # the URL was encoded before, but we want the normal version
        $static = MT::Util::decode_url($static);
    }
    my $params = {
        blog_id => $blog_id,
        static  => $static,
    };
    $params->{entry_id} = $entry_id if defined $entry_id;
    return $params;
}

sub __create_return_url {
    my $app = shift;
    my $q   = $app->param;
    my $cfg = $app->config;

    my $blog_id = $q->param("blog_id");
    $blog_id =~ s/\D//g;

    my @params = ( "__mode=handle_sign_in", "key=Facebook" );

    if ( my $entry_id = $q->param("entry_id") ) {
        $entry_id =~ s/\D//g;
        push @params, "entry_id=$entry_id";
    }

    my $return_url
        = $app->base
        . $app->path
        . $cfg->CommentScript . "?"
        . join( '&', @params );
    return _encode_url($return_url);
}

sub login {
    my $class = shift;
    my ($app) = @_;
    my $q     = $app->param;

    my $blog_id          = $app->blog->id;
    my $facebook_api_key = instance($app)
        ->get_config_value( 'facebook_app_key', "blog:$blog_id" );

    my $url = "https://www.facebook.com/dialog/oauth?"
        . join( '&',
        "client_id=" . $facebook_api_key,
        "redirect_uri=" . __create_return_url($app),
        'state=' . _generate_state_session($app),
        );
    return $app->redirect($url);
}

sub _generate_state_session {
    my $app = shift;

    return $app->error(
        $app->translate(
            'The login could not be confirmed because of no/invalid blog_id')
    ) unless $app->blog;

    my $static = $app->param('static') || '';

    my $state_session = $app->model('session')->new;
    $state_session->kind('OT');    # One time Token
    $state_session->id( $app->make_magic_token );
    $state_session->start(time);
    $state_session->duration( time + 5 * 60 );
    $state_session->set( 'blog_id', $app->blog->id );
    $state_session->set( 'static',  $static );
    $state_session->save
        or return $app->error(
        $app->translate(
            "The login could not be confirmed because of a database error ([_1])",
            $state_session->errstr
        )
        );

    $state_session->id;
}

sub handle_sign_in {
    my $class = shift;
    my ( $app, $auth_type ) = @_;
    my $q      = $app->param;
    my $plugin = instance($app);

    if ( $q->param("error") ) {
        return $app->error(
            $plugin->translate(
                "Authentication failure: [_1], reason:[_2]",
                $q->param("error"),
                $q->param("error_description")
            )
        );
    }

    my $state_session_id = $q->param('state');
    my $state_session;
    my $blog_id;
    my $static;
    if ($state_session = MT::Session::get_unexpired_value(
            5 * 60, { id => $state_session_id, kind => 'OT' }
        )
        )
    {
        $blog_id = $state_session->get('blog_id');
        $static  = $state_session->get('static');
        $state_session->remove();
    }
    else {
        return $app->error(
            'The state parameter is missing or not matched with session.');
    }
    $app->param( 'blog_id', $blog_id );
    $app->param( 'static',  $static );

    my $success_code = $q->param("code");
    my $ua = $app->new_ua( { paranoid => 1 } );

    my $facebook_api_key
        = $plugin->get_config_value( 'facebook_app_key', "blog:$blog_id" );
    my $facebook_api_secret
        = $plugin->get_config_value( 'facebook_app_secret', "blog:$blog_id" );

    my $return_url = __create_return_url($app);

    my @url_params = (
        "client_id=$facebook_api_key",        "redirect_uri=$return_url",
        "client_secret=$facebook_api_secret", "code=$success_code"
    );

    my $url = "https://graph.facebook.com/oauth/access_token?"
        . join( '&', @url_params );
    my $response = $ua->get($url);
    return $app->errtrans("Invalid request.")
        unless $response->is_success;

    my $content = $response->decoded_content();
    require JSON;
    my $j_msg = eval { JSON::from_json($content) };

    return $app->errtrans("Invalid request.")
        unless $j_msg && ref $j_msg eq 'HASH' && $j_msg->{access_token};

    my $access_token = $j_msg->{access_token};
    $access_token =~ s/\s//g;
    $access_token =~ s/&.*//;

    $url      = "https://graph.facebook.com/me?access_token=$access_token";
    $response = $ua->get($url);
    return $app->errtrans("Invalid request.")
        unless $response->is_success;

    my $user_data = JSON::from_json( $response->decoded_content() );

    my $nickname = $user_data->{name};
    my $fb_id    = $user_data->{id};

    my $author_class = $app->model('author');
    my $cmntr        = $author_class->load(
        {   name      => $fb_id,
            type      => $author_class->COMMENTER(),
            auth_type => $auth_type,
        }
    );

    if ( not $cmntr ) {
        $cmntr = $app->make_commenter(
            name        => $fb_id,
            nickname    => $nickname,
            auth_type   => $auth_type,
            external_id => $fb_id,
            url         => "https://www.facebook.com/$fb_id",
        );
    }

    return $app->error( $plugin->translate("Failed to created commenter.") )
        unless $cmntr;

    __get_userpic($cmntr);

    $app->make_commenter_session($cmntr)
        or return $app->error(
        $plugin->translate("Failed to create a session.") );

    return $cmntr;
}

sub __get_userpic {
    my ($cmntr) = @_;

    if ( my $userpic = $cmntr->userpic ) {
        require MT::FileMgr;
        my $fmgr     = MT::FileMgr->new('Local');
        my $mtime    = $fmgr->file_mod_time( $userpic->file_path() );
        my $INTERVAL = 60 * 60 * 24 * 7;
        if ( $mtime > time - $INTERVAL ) {

            # newer than 7 days ago, don't download the userpic
            return;
        }
    }

    my $picture_url
        = "https://graph.facebook.com/"
        . $cmntr->external_id
        . "/picture?type=large";

    if ( my $userpic = asset_from_url($picture_url) ) {
        $userpic->tags('@userpic');
        $userpic->created_by( $cmntr->id );
        $userpic->save;
        if ( my $userpic = $cmntr->userpic ) {

         # Remove the old userpic thumb so the new userpic's will be generated
         # in its place.
            my $thumb_file = $cmntr->userpic_file();
            my $fmgr       = MT::FileMgr->new('Local');
            if ( $fmgr->exists($thumb_file) ) {
                $fmgr->delete($thumb_file);
            }
            $userpic->remove;
        }
        $cmntr->userpic_asset_id( $userpic->id );
        $cmntr->save;
    }
}

sub __check_api_configuration {
    my ( $app, $plugin, $facebook_api_key, $facebook_api_secret ) = @_;

    if (    ( not eval { require Crypt::SSLeay; 1; } )
        and ( not eval { require IO::Socket::SSL; 1; } ) )
    {
        return $plugin->error(
            $plugin->translate(
                "Facebook Commenters needs either Crypt::SSLeay or IO::Socket::SSL installed to communicate with Facebook."
            )
        );
    }

    return $plugin->error(
        $plugin->translate("Please enter your Facebook App key and secret.") )
        unless ( $facebook_api_key and $facebook_api_secret );

    my $url = "https://graph.facebook.com/oauth/access_token?";
    $url .= join( '&',
        "client_id=$facebook_api_key",
        "client_secret=$facebook_api_secret",
        "grant_type=client_credentials",
    );

    my $ua       = $app->new_ua( { paranoid => 1 } );
    my $response = $ua->get($url);
    my $content  = $response->decoded_content();

    # Facebook is returning JSON response
    require JSON;
    my $j_msg = eval { JSON::from_json($content) };

    if (   $response->is_error
        or !$j_msg
        or ref $j_msg ne 'HASH'
        or !$j_msg->{access_token} )
    {
        if ( $j_msg and ref $j_msg eq 'HASH' && $j_msg->{error} ) {
            my $error = $j_msg->{error};
            $content = $error->{message};
            $content .= " [" . $error->{type} . "]" if $error->{type};
        }
        return $plugin->error(
            $plugin->translate(
                "Could not verify this app with Facebook: [_1]", $content
            )
        );
    }

    return 1;
}

my $mt_support_save_config_filter;

sub plugin_data_pre_save {
    my ( $cb, $obj, $original ) = @_;

    return 1 if $mt_support_save_config_filter;

    my ( $args, $scope ) = ( $obj->data, $obj->key );

    return 1
        unless ( $obj->plugin eq $PluginKey )
        && ( $scope =~ m/^configuration/ );

    $scope =~ s/^configuration:?|:.*//g;
    return 1 unless $scope eq 'blog';

    my $facebook_api_key    = $args->{facebook_app_key};
    my $facebook_api_secret = $args->{facebook_app_secret};

    my $app    = MT->instance;
    my $plugin = instance($app);

    return __check_api_configuration( $app, $plugin, $facebook_api_key,
        $facebook_api_secret );
}

sub check_api_key_secret {
    my ( $cb, $plugin, $data ) = @_;

    $mt_support_save_config_filter = 1;

    my $app = MT->instance;

    my $facebook_api_key    = $data->{facebook_app_key};
    my $facebook_api_secret = $data->{facebook_app_secret};

    return __check_api_configuration( $app, $plugin, $facebook_api_key,
        $facebook_api_secret );
}

sub GreetFacebookCommenters {
    return '';
}

sub _encode_url {
    my ( $str, $enc ) = @_;
    $enc ||= MT->config->PublishCharset;
    my $encoded = Encode::encode( $enc, $str );
    $encoded =~ s!([^a-zA-Z0-9_.-])!uc sprintf "%%%02x", ord($1)!eg;
    $encoded;
}

1;
