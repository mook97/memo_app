// メイン関数############################################################################################################################################################
// ユーザ捜査に対する処理
// ショートカットキーとボタン操作について・・・
$(function () {
	setWindow();
  loadText();
  alert("aaaaa");

	// 保存機能------------------------------------------------------------
  $('#save').on('click', saveText);
  $(window).on('keydown', function(e) {
    // Ctrl + S
    if(e.ctrlKey && (e.keyCode === 83)) {
      saveText();
    }
  });
	
	// メモアプリ終了------------------------------------------------------------
  $('#cancel').on('click', function(e){
		saveText();
		window.close();
	});
  $(window).on('keydown', function(e) {
    // Ctrl + Q
    if(e.ctrlKey && (e.keyCode === 81)) {
			saveText();
			window.close();
    }
	});

	// 詳細設定表示------------------------------------------------------------
	$('#conf-detail-btn').on('click', acordion_move);
  $(window).on('keydown', function(e) {
    // Ctrl + D
    if(e.ctrlKey && (e.keyCode === 68)) {
      $('#conf-detail-btn').click();
    }
	});

	// 次のメモを開く------------------------------------------------------------
	$('#new').on('click', function(e){
		var id_str = $('#memo_id').text();
    var new_id = Number(id_str.slice(id_str.search('[^0]'))) + 1;
    // 現在のメモの管理番号の最大値を超えた場合
    loadText(('00000' + new_id).slice(-5));
	});

	// 前のメモを開く------------------------------------------------------------
	$('#pre').on('click', function(e){
    var id_str = $('#memo_id').text()
    var pre_id = Number(id_str.slice(id_str.search('[^0]'))) - 1;
    alert(pre_id);
		loadText(('00000' + pre_id).slice(-5));
	});

  // 新規メモを作成<Button>------------------------------------------------------------
  $('#add').on('click', function(e) {
    saveText();
    loadText();
  });

  // 新規メモを作成<Command>------------------------------------------------------------
  $(window).on('keydown', function(e) {
    // Ctrl + R
    if(e.ctrlKey && (e.keyCode === 82)) {
      $('#add').click();
    }
  });

	// すべてのメモをテーブル表示する------------------------------------------------------------
	$('#table-visible').on('click', all_memo_visible);
  $(window).on('keydown', function(e) {
    // Ctrl + T
    if(e.ctrlKey && (e.keyCode === 84)) {
      all_memo_visible();
    }
	});
  
	// ページのリロード(初期ページが表示される)))------------------------------------------------------------
	$('#memo-visible').on('click', function(e){location.reload();});
	$('#page-reload').on('click', function(e){location.reload();});
  $(window).on('keydown', function(e) {
    // Ctrl + T
    if(e.ctrlKey && (e.keyCode === 69)) {
      location.reload();
    }
  });
});