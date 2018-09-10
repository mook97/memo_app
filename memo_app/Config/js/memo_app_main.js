// メイン関数############################################################################################################################################################
$(function () {
	setWindow();
  
	if(loadText()){
		loadText();
	}

	// 保存機能
  $('#save').on('click', function(e){
    saveText();
    loadText($('#memo_id').text(), 0, 1);
  });
  $(window).on('keydown', function(e) {
    // Ctrl + S
    if(e.ctrlKey && (e.keyCode === 83)) {
      saveText();
      loadText($('#memo_id').text(), 0, 1);
    }
  });

  // 削除機能
  $('#delete').on('click', function(e){
    delete_text();
    loadText();
  })

  // ファイルとして保存
  $('#save_us').on('click', function(e){
    save_as();
  })
	
	// メモアプリ終了
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

	// 詳細設定表示
	$('#conf-detail-btn').on('click', acordion_move);
  $(window).on('keydown', function(e) {
    // Ctrl + D
    if(e.ctrlKey && (e.keyCode === 68)) {
      $('#conf-detail-btn').click();
    }
	});

	// 次のメモを開く
	$('#new').on('click', function(e){
    saveText($('#memo_id').text(), 0, 1);
		var id_str = $('#memo_id').text();
    // 現在のメモの管理番号の最大値を超えた場合
    var next_id = Number(id_str.slice(id_str.search('[^0]'))) + 1;
    loadText(('00000' + next_id).slice(-5), 0, 1);
	});

	// 前のメモを開く
	$('#pre').on('click', function(e){
    saveText($('#memo_id').text(), 0, 1);
    var id_str = $('#memo_id').text()
    var pre_id = Number(id_str.slice(id_str.search('[^0]'))) - 1;
		loadText(('00000' + pre_id).slice(-5), 0, 1);
	});

  // 新規メモを作成<Button>
  $('#add').on('click', function(e) {
    loadText(1, 1);
  });
  // 新規メモを作成<Command>
  $(window).on('keydown', function(e) {
    // Ctrl + R
    if(e.ctrlKey && (e.keyCode === 82)) {
      $('#add').click();
    }
  });

	// すべてのメモをテーブル表示する
	$('#table-visible').on('click', function(){
    all_memo_visible();
  });
  $(window).on('keydown', function(e) {
    // Ctrl + T
    if(e.ctrlKey && (e.keyCode === 84)) {
      all_memo_visible();
    }
	});
	
	// ページのリロード(初期ページが表示される)))
	$('#memo-visible').on('click', function(e){location.reload();});
	$('#page-reload').on('click', function(e){
    $("#memo-input-form").removeClass("hidden_group");
    $("#all-memo").addClass("hidden_group");
    setWindow();
  });

  // tableのIDクリックで該当IDのメモページを表示
  $('#memo-table').on('click', '[id*="memo_id--"]', function(){
    $("#memo-input-form").removeClass("hidden_group");
    $("#all-memo").addClass("hidden_group");
    setWindow();
    loadText($(this).text());
  });

  // tableのIDクリックで該当IDのメモページを表示
  $('#memo-table').on('click', '.td-group', function(){
    if($(this).hasClass('active')){
      $(this).removeClass('active');
    }
    else{
      $(this).addClass('active');
    }
  });

  // tableの表示量の設定
  $('#line-set').on('click', function(){
    all_memo_visible($('#all-memo .num').val());
  });

  // tableの表示量の設定
  $('#all-memo .pre').on('click', function(){
      var last_id = Number($('#visible-last-id').text()) + (Number($('#all-memo .num').val()) * 2);
      all_memo_visible($('#all-memo .num').val(), last_id);
  });

  // tableの表示量の設定
  $('#all-memo .next').on('click', function(){
    if(!($('#visible-last-id').text() < 0)){
      all_memo_visible($('#all-memo .num').val(), $('#visible-last-id').text());
    }
    else{
      msg_show('次のデータはありません。', 'alert-danger');
    }
  });
});