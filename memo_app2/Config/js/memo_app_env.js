// ここは適当にいじっていいです。
// 好きなように画面サイズを変更してください。

// 定数の定義
const FILE = location.href.replace('file:///', '').replace(location.href.split('/').pop(), '/Data/json/');　// メモ出力用のCSVファイル
const LAST_DATA_FILE = location.href.replace('file:///', '').replace(location.href.split('/').pop(), '/Config/last_data_file.json');　// 最後に作成されたデータ
const FILE_LIST = location.href.replace('file:///', '').replace(location.href.split('/').pop(), '/Config/all_file.json');　 // ファイルリスト
const TASK_LIST = location.href.replace('file:///', '').replace(location.href.split('/').pop(), '/Config/all_task.json');　 // ファイルリスト
const INDENT = '  ';   　　    // Indent : 2 Spaces  タブキーをスペース２つに変換
const NORMAL_WIDTH = 344;  　　// 標準時の画面サイズ(横)
const NORMAL_HEIGHT = 478;　　 // 標準時の画面サイズ(縦)
const OP_DETAILS_HEIGHT = 615; // 詳細メニュー表示時の画面サイズ(縦)
const OP_TABLE_HEIGHT = 930;   // テーブル表示(縦)
const OP_TABLE_WIDTH = 1000;    // テーブル表示(横)

// ADODB

//var WRITE = new ActiveXObject("ADODB.Stream");



/* -------   処理ここから   -------- */

//const FILE_FROM = "read.txt";
//const FILE_TO = "write.txt";


// selectboxの要素をまとめておく
function all_select_item_ini(){
  group1 = '<div class="row"><span class="col-3">Group2</span><select id="group1" class="custom-select detail_groups col-9"></select>	</div>'
  group2 = '<div class="row"><span class="col-3">Group2</span><select id="group2" class="custom-select detail_groups col-9"></select>	</div>'
  $('#my-list-groups').empty();
  $('#my-list-groups').append(group1 + group2);

	// Group1
	$('#group1').empty();
	$('#group1').append('<option value="00">Group1</option>');
	$('#group1').append('<option value="01">data1-1</option>');
	$('#group1').append('<option value="02">data1-2</option>');
	$('#group1').append('<option value="03">data1-3</option>');
	$('#group1').append('<option value="04">data1-4</option>');
	$('#group1').append('<option value="05">data1-5</option>');

	// Group2 
	$('#group2').empty();
	$('#group2').append('<option value="00">Group2</option>');
	$('#group2').append('<option value="01">data2-1</option>');
	$('#group2').append('<option value="02">data2-2</option>');
	$('#group2').append('<option value="03">data2-3</option>');
	$('#group2').append('<option value="04">data2-4</option>');
	$('#group2').append('<option value="05">data2-5</option>');
}

// Memoの要素の取得用(Array)
function get_memo_items(){
	var group1_str = $('#group1').val() + ':' + $('#group1 option:selected').text();
  var group2_str = $('#group2').val() + ':' + $('#group2 option:selected').text();
  var result_data = [
    $('#memo_id').text(),
    $('#memo_title').val(),
    $('#memo_text').val(),
    $('#memo_create').text(),
    getDateTime(),
    0,
    group1_str,
    group2_str
  ];
  return result_data;
}

// Memoの要素の取得用(Json)
function get_memo_json(){
  var val = get_memo_items();
  var result_json = {};
  result_json["id"] = val[0];
  result_json["title"] = val[1];
  result_json["memo"] = val[2];
  result_json["create_time"] = val[3];
  result_json["update_time"] = val[4];
  result_json["hidden_flg"] = val[5];
  result_json["group1"] = val[6];
  result_json["group2"] = val[7];
  return result_json;
}

function set_memo_items(itmes){
  $('#memo_id').text(itmes["id"]);
  $('#memo_title').val(itmes["title"]);
  $('#memo_text').val(itmes["memo"]);
  $('#memo_create').text(itmes["create_time"]);
  $('#memo_update').text(itmes["update_time"]);
  $('#group1').val(itmes["group1"].slice(0, 2));
  $('#group2').val(itmes["group2"].slice(0, 2));
}

