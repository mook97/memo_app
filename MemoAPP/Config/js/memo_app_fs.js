// loadText:CSVファイルの読み込み用##############################################################################
// 引数で管理番号の０埋めをのぞいた数字を渡す(なかったら最新のメモ)
// 戻り値(1の場合は新しいメモを作成する。)
function loadText(id, new_flg) {
  var last_id = get_last_id();
  var new_id = Number(last_id.slice(last_id.search('[^0]'))) + 1; // 新規作成する場合

  if(id === undefined){
    id = last_id;                         // それ以外の時は最後に作成されたファイルをデフォルトで開く
    if(last_id === '00000'){id = '00001'} // 初めて起動したとき用
  }
  else if(new_flg === 1){
    var id = ('00000' + new_id).slice(-5);
  }
  else if(Number(id.slice(id.search('[^0]'))) >= new_id){
    id = "00001";
  }
  else if(Number(id.slice(id.search('[^0]'))) <= 0){
    id = last_id;
  }

  var file = FILE + id + ".json";
  var init_data = '{"id":"' + id + '","title":"","memo":"","create_time":"' + getDateTime() + '","update_time":"","hidden_flg":0,"group1":"00:Group1","group2":"00:Group2"}'

  var data = file_rw(file, 0);
  if (data === undefined || id > last_id) {
      file_rw(file, 1, init_data);
      msg_show('管理番号: '+ id + 'のファイルを作成しました。(loadText)', 'alert-success');
      var data = file_rw(FILE + id + ".json", 0);
      if(Number(id.slice(id.search('[^0]'))) >= new_id){set_last_id(id)}
  }

  var data_array = JSON.parse(data);
  set_memo_items(data_array);         // 配列を画面に出力
}

// saveText:ファイルへの保存用##############################################################################
function saveText(id,arg1, msg_hidden) {
  if(id === undefined){id = $('#memo_id').text();}
  var items_array = get_memo_json();
  var data = JSON.stringify(items_array);
  file_rw(FILE + id + '.json', 1, data);
  if(!(msg_hidden === 1)){
    msg_show('管理番号: '+ id + 'のデータを保存しました。(saveText)', 'alert-success');
  }
}

// jsonファイルの削除##############################################################################
function delete_text(id){
  var fso = new ActiveXObject( "Scripting.FileSystemObject" );
  var last_id = get_last_id();                     // 一番最後のデータを消された場合・・
  if(id === undefined){id = $('#memo_id').text();} // 引数指定がない場合は・・
  // ファイルの書き込み権限で開く
  try {
    fso.DeleteFile(FILE + id + '.json', true); // ファイルがあれば削除する
  }
  catch(e) {
    msg_show('ファイル削除に失敗しました。(delete_text)', 'alert-danger');
    return;
  }
  file = null;
  fso = null;

  if(id === last_id){
    var new_id = Number(last_id.slice(last_id.search('[^0]'))) -1;
    set_last_id(('00000' + new_id).slice(-5));
  }
  msg_show('管理番号: '+ id + 'のファイルを削除しました。(delete_text)', 'alert-danger');
}

// 名前を付けてファイルを保存##############################################################################
function save_as(text, file_name){
  var data = get_memo_json();
  if(text === undefined){
    text = 'タイトル:' + data['title'] + '\r\n本文' + data['memo']
            + '\r\ngroup1:' + data['group1'] + '\r\ngroup2:' + data['group2']
            + '\r\n作成日：' + data['create_time'] + '\r\n最終更新日' + data['update_time']
  }
  if(file_name === undefined){file_name = data['id'] + '_' + data['create_time'] + '.txt'}

  var b = new Blob(["\uFEFF", text]);
  if (navigator.msSaveBlob) {
      navigator.msSaveOrOpenBlob(b, file_name);
  } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.setAttribute('download', file_name);
      a.dispatchEvent(new CustomEvent('click'));
  }
}

function task_add(){
  var new_task = {
    "task": $('#new-task-add .task-text').val(),
    "type": $('#new-task-add .task-progress').val(),
    "start": $('#new-task-add .start').val(),
    "end": $('#new-task-add .end').val()
  };

  var all_task = JSON.parse(file_rw(TASK_LIST, 0));
  all_task.push(new_task);
  file_rw(TASK_LIST, 1,JSON.stringify(all_task, undefined, 2));
  all_task_visible();
}

function task_save(task_id){
  var task = {
    "task" : $('#' + task_id + ' .task-text').val(),
    "type" : $('#' + task_id + ' .task-progress').val(),
    "start": $('#' + task_id + ' .start').val(),
    "end"  : $('#' + task_id + ' .end').val()
  };

  var task_num = task_id.slice(task_id.search('[^task-num-]'))

  var all_task = JSON.parse(file_rw(TASK_LIST, 0));
  all_task[task_num] = task;
  file_rw(TASK_LIST, 1,JSON.stringify(all_task, undefined, 2));
  all_task_visible();
}

function task_all_save(){
  var all_task = [];
  for(var i = 0; true; i ++){
    if(document.getElementById('task-num-' + i) === null){break;}
    all_task[i] = {
      "task" : $('#task-num-' + i + ' .task-text').val(),
      "type" : $('#task-num-' + i + ' .task-progress').val(),
      "start": $('#task-num-' + i + ' .start').val(),
      "end"  : $('#task-num-' + i + ' .end').val()
    };
  }
  file_rw(TASK_LIST, 1,JSON.stringify(all_task, undefined, 2));
  all_task_visible();
}

function task_del(id){
  var all_task = JSON.parse(file_rw(TASK_LIST, 0));
  all_task.splice(id, id);
  file_rw(TASK_LIST, 1,JSON.stringify(all_task, undefined, 2));
  all_task_visible();
}

function get_file_list(){
  var fso = new ActiveXObject('Scripting.FileSystemObject');
  var files = [];
  // ファイルを一つずつ処理する
  var e = new Enumerator(fso.GetFolder(FILE).Files);
  for (; !e.atEnd(); e.moveNext()) {
    var file = e.item();
    if(file.Name === 'all_task.json' || file.Name === 'last_data_file.json'){
    }
    else{
      files.push(file.Name);
    }
  }
  return files;
}

// ファイルを読み込み権限で開き全データを返す。
function file_rw(arg_file, rw, arg_data, arg_charset){
  const TYPE_BINARY = 1; // バイナリ(保存データの種類-http://msdn.microsoft.com/ja-jp/library/cc389884.aspx)
  const TYPE_TEXT   = 2; // テキスト(保存データの種類)
  const READ_ALL   = -1; // 全行    (読み込み方法-http://msdn.microsoft.com/ja-jp/library/cc389881.aspx)
  const READ_LINE  = -2; // 一行ごと(読み込み方法)
  const WRITE_CHAR = 0; // 改行なし(書き込み方法-http://msdn.microsoft.com/ja-jp/library/cc389886.aspx)
  const WRITE_LINE = 1; // 改行あり(書き込み方法)
  const SAVE_TEXT       = 1; // ない場合は新規作成(ファイルの保存方法-http://msdn.microsoft.com/ja-jp/library/cc389870.aspx)
  const SAVE_WRITE_TEXT = 2; // ある場合は上書き  (ファイルの保存方法)

  var stream     = new ActiveXObject("ADODB.Stream");  // 必要なライブラリを読み込み
  stream.Type    = TYPE_TEXT;                          // 読み込みタイプをテキスト形式で
  var charset = ["utf-8", "Shift_JIS"]
  if (arg_charset === undefined) { arg_charset = 0 }
  stream.charset = charset[arg_charset];               // ファイルの文字コード
  stream.Mode    = 8;                                  // ファイルの読み取りモード
  stream.Open();


  if(rw === 0){
    // read
    try {
      stream.LoadFromFile(arg_file);          // ファイルを読み込み
      var data = stream.ReadText(READ_ALL); // ファイルから全データを取得する
      stream.Close();  // オブジェクトを閉じる
      stream = null;   // 後処理
      return data;   // 戻り値
    }catch(e) {
      // msg_show('ファイル読み込みに失敗しました。(read_ALL)', 'alert-danger');
      stream = null;   // 後処理
      return undefined;
    }
  }else if(rw === 1) {
    // write
    try {
      stream.SaveToFile(arg_file, SAVE_WRITE_TEXT);
      stream.LoadFromFile(arg_file);          // ファイルを読み込み
      stream.SetEOS();
      stream.WriteText(arg_data, WRITE_LINE); // ファイルから全データを取得する
      stream.SaveToFile(arg_file, SAVE_WRITE_TEXT);
      stream.Close();  // オブジェクトを閉じる
      stream = null;   // 後処理
    }catch(e) {
      msg_show('ファイル書き込みに失敗しました。(read_ALL)', 'alert-danger');
      stream = null;   // 後処理
      return undefined;
    }
  }
}

function get_last_id(){var data = file_rw(LAST_DATA_FILE, 0); return JSON.parse(data).last_id;} // 一番最後に作成されたデータを取得する
function set_last_id (id){
  if(id === "00000"){
    file_rw(LAST_DATA_FILE, 1, '{"last_id": "' + "00001" + '"}');  // 一番最後に作成されたデータを更新する
  }else{
    file_rw(LAST_DATA_FILE, 1, '{"last_id": "' + id + '"}');  // 一番最後に作成されたデータを更新する
  }
}