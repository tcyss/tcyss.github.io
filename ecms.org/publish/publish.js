$(function(){
  $('#topics').click(function(){
    var result = confirm("セキュリティトピックの項目を反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'topics',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });

  $('#torikumi').click(function(){
    var result = confirm("東京都の取組の項目を反映させます。よろしいですか？");
    if(result){
      $('.stat').html('同期中です...');
      $.ajax({
        url: 'publish.php',
        type: 'GET',
        data: {
          type: 'torikumi',
          token: 'password'
        }
      }).done(function (res) {
        alert("完了しました");
        $('.stat').html('');
    }).fail(function (res){});
    }
  });

  $('#all').click(function(){
    var result = confirm("すべての項目を反映させます。よろしいですか？");
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
});
