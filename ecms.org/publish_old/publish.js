$(function(){
  $('#all').click(function(){
    var result = confirm("すべての更新を本番環境に反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'all',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });

  $('#cysec').click(function(){
    var result = confirm("サイト「サイバーセキュリティ対策の極意」で行った更新を本番環境に反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'cysec',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });

  $('#secroom').click(function(){
    var result = confirm("サイト「セキュリティの部屋」で行った更新を本番環境に反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'secroom',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });

  $('#news').click(function(){
    var result = confirm("サイト「更新情報」で行った更新を本番環境に反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'news',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });
});
