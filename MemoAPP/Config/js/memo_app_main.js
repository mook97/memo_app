// メイン関数############################################################################################################################################################
$(function () {
	setWindow();           // 画面サイズを初期化
  loadText();            // 表示するメモを最新に更新する
  all_select_item_ini(); // select要素の初期化

// ヘッダー関連------------------------------------------------------------------------------------------
	// すべてのメモをテーブル表示する
	$('#table-visible').on('click', function(){
    $('#memo_app_msg').empty();
    $("#memo-input-form").removeClass("active");     // 他の処理で現在の処理中の処理を取得するため
    $("#memo-input-form").addClass("hidden_group");  // 表示を無効
    $("#all-memo").removeClass("hidden_group");      // 表示を有効
    $("#all-memo").addClass("active");               // 他の処理で現在の処理中の処理を取得するため
    $('#all-task').addClass('hidden_group')
    $('#all-task').removeClass('active');
    all_memo_visible();
  });
  $(window).on('keydown', function(e) {
    // Ctrl + T
    if(e.ctrlKey && (e.keyCode === 84)) {
      $('#table-visible').click();
    }
	});

	// メモ入力フォームを表示
	$('#memo-visible').on('click', function(e){
    $('#memo_app_msg').empty();
    $('#memo-input-form').addClass('active');
    $('#memo-input-form').removeClass('hidden_group');
    $('#all-memo').removeClass('active');
    $('#all-memo').addClass('hidden_group');
    $('#all-task').addClass('hidden_group')
    $('#all-task').removeClass('active');
    if(!($('#memo-input-form').prop('user-width') === undefined && $('#memo-input-form').prop('user-height') === undefined)) {
      setWindow($('#memo-input-form').prop('user-height'), $('#memo-input-form').prop('user-width'));
      if($('#conf-detail-btn').hasClass('active')){
        $('#conf-detail-btn').click()
      }
    }
  });
  
  // task 
	$('#task-visible').on('click', function(){
    $('#memo_app_msg').empty();
    $('#memo-input-form').removeClass('active');
    $('#memo-input-form').addClass('hidden_group');
    $('#all-memo').removeClass('active');
    $('#all-memo').addClass('hidden_group');
    $('#all-task').removeClass('hidden_group')
    $('#all-task').addClass('active');
    if(!($('#all-task').prop('user-width') === undefined && $('#all-task').prop('user-height') === undefined)) {
      setWindow($('#all-task').prop('user-height'), $('#all-task').prop('user-width'));
    }
    all_task_visible();
  });

  // ページのリロード(初期ページが表示される)))
	$('#page-reload').on('click', function(e){
    if($("#memo-input-form").hasClass("active")){
      $("#memo-input-form").removeClass("hidden_group");
      $("#all-memo").addClass("hidden_group");
      $("#all-memo").removeClass("active");
      $("#all-task").addClass("hidden_group");
      $("#all-task").removeClass("active");
    }else if($("#all-memo").hasClass("active")){
      $("#memo-input-form").addClass("hidden_group");
      $("#memo-input-form").removeClass("active");
      $("#all-memo").removeClass("hidden_group");
      $("#all-task").addClass("hidden_group");
      $("#all-task").removeClass("active");
    } else if($('#all-task').hasClass("active")){
      $("#memo-input-form").addClass("hidden_group");
      $("#memo-input-form").removeClass("active");
      $("#all-memo").addClass("hidden_group");
      $("#all-memo").removeClass("active");
      $("#all-task").removeClass("hidden_group");      
    }
    $('#memo_app_msg').empty();
  });






// メモ関連------------------------------------------------------------------------------------------------------------
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

  var timer = false;
  $(window).resize(function() {
      if (timer !== false) {
          clearTimeout(timer);
      }
      timer = setTimeout(function() {
          // alert('resized');
          if($("#memo-input-form").hasClass("active")){  // メモ入力フォームへの処理
            $('#memo-input-form').prop('user-height', window.outerHeight);
            $('#memo-input-form').prop('user-width', window.outerWidth);
          } else if($("#all-memo").hasClass("active")){
            $('#all-memo').prop('user-height', window.outerHeight);
            $('#all-memo').prop('user-width', window.outerWidth);
            $('tbody.scrollBody').css({"height" : Number(window.outerHeight - 170) + "px", "width" : Number(window.outerWidth - 18) + "px"})
          } else if($("#all-task").hasClass("active")) {
            $('#all-task').prop('user-height', window.outerHeight);
            $('#all-task').prop('user-width', window.outerWidth);
            $('#all-task .scrollBody').css({"height" : Number(window.outerHeight - 85) + "px", "width" : Number(window.outerWidth - 18) + "px"})
          }
      }, 200);
  });



  // 削除機能
  $('#delete').on('click', function(e){
    var id = $('#memo_id').text();
    bootbox.confirm({
      message: "ファイルが削除されます。よろしいですか?",
      buttons: {confirm: {label: 'OK',className: 'btn-danger'},cancel: {label: 'Cancel',className: ''}},
      callback: function (result) {
        if (result) {
          delete_text();
          loadText(("00000" + (Number(id) - 1)).slice(-5));
        } else{ msg_show("Cancelしました。") }
      }
    });
  });

  // ファイルとして保存
  $('#save_us').on('click', function(e){
    save_as();
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
    var id   = $('#memo_id').text();
    var last = ("00000" + (Number(get_last_id()) + 1)).slice(-5)
    if(("00000" + (Number(id) + 1)).slice(-5) === last){
      msg_show('最新のデータです。');
    } else {
      loadText(("00000" + (Number(id) + 1)).slice(-5));
    }
	});

	// 前のメモを開く
	$('#pre').on('click', function(e){
    saveText($('#memo_id').text(), 0, 1);
    var id = $('#memo_id').text();
    if(("00000" + (Number(id) - 1)).slice(-5) === "00000"){
      
      msg_show('最後のデータです。');
    } else {
      loadText(("00000" + (Number(id) - 1)).slice(-5));
    }
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



// メモテーブル表示---------------------------------------------------------------------------------------------
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
    all_memo_visible($('#all-memo .num').val(), $('#visible-last-id').text());
  });



// タスク管理用-----------------------------------------------------------------------------------------------------------------------
  $(document).on('focus', ".datepickr", function(){
    $(this).flatpickr({
      enableTime: true,
      dateFormat: "Y-m-d-H:i",
      defaultDate: new Date()
    })
  });

  $(document).on('click', '#new-task-add .add', function(){
    task_add();
  })

  $(document).on('click', "#all-task-table .del", function(){
    var task_id = $(this).parent().parent().attr('id');
    task_del(task_id.slice(task_id.search('[^task-num-]')));
  })

  $(document).on('click', "#all-task-table .save", function(){
    task_save($(this).parent().parent().attr('id'));
  })

  $(document).on('click', "#new-task-add .all-save", function(){
    task_all_save();
  })

  var $textarea = $('.task-text');
  var lineHeight = parseInt($textarea.css('lineHeight'));
  $(document).on('click', ".task-text",function(e) {
    var lines = ($(this).val() + '\n').match(/\n/g).length;
    $(this).height(lineHeight * lines);
  });

  $(document).on('input', ".task-text",function(e) {
    var lines = ($(this).val() + '\n').match(/\n/g).length;
    $(this).height(lineHeight * lines);
  });
});