

// Array_ToCSV:配列をcsvで保存するfunction ##############################################################################
// https://qiita.com/banaoh/items/4119c0e23053b1cfa80b
function Array_ToCSV(content){
	var formatCSV = '';
  for (var i = 0; i < content.length; i++) {
		var value = content[i];
		for (var j = 0; j < value.length; j++) { 
			var innerValue = value[j]===null?'':value[j].toString();
			var result = innerValue.replace(/"/g, '""');
			result = '"' + result + '"';

      if (j > 0){
				formatCSV += ',';
      	formatCSV += result;
			}
			else if(j === 0) {
				formatCSV += result;
			}
    }
    formatCSV += '\r\n';  // 改行(Windows用)
	}
	return formatCSV;
}

// CSV_ToArrayを使用してファイルデータ取得から配列作成までを一気にする
function text_ToArray(){
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	var file;

	try {
			file = fso.OpenTextFile(FILE, 1, false, false);
			var data = file.ReadAll();
	}
	catch(e) {
			msg_show('ファイル読み込みに失敗しました。(text_ToArray)</br>アプリを再起動してください','alert-danger');
			return;
	}
	return CSV_ToArray(data); // 取得したファイルデータを配列にしてそのまま戻り値に使用
}

// CSV_ToArray:CSVを配列に変換 ##############################################################################
// http://memo.lovechu.net/2012/04/10-202257.php
function CSV_ToArray(text, delim) {
	if (!delim) delim = ',';
	var tokenizer = new RegExp(delim + '|\r?\n|[^' + delim + '"\r\n][^' + delim + '\r\n]*|"(?:[^"]|"")*"', 'g');

	var record = 0, field = 0, data = [['']], qq = /""/g;
	text.replace(/\r?\n$/, '').replace(tokenizer, function(token) {
		switch (token) {
			case delim: 
				data[record][++field] = '';
				break;
			case '\n': case '\r\n':
				data[++record] = [''];
				field = 0;
				break;
			default:
				data[record][field] = (token.charAt(0) != '"') ? token : token.slice(1, -1).replace(qq, '"');
		}
	});

	return data;
}

// on_function:タブキーでインデント##############################################################################
function on_function(e, textarea) {
	e.preventDefault();
	var start = textarea.selectionStart;
	var end   = textarea.selectionEnd;
	var before = textarea.value.substring(0, start);
	var after  = textarea.value.substring(end, textarea.value.length);
	textarea.value = before + INDENT + after;
	textarea.selectionStart = textarea.selectionEnd = end + INDENT.length - (end - start);
  }
  
  
  
  // getDateTime:日時取得用の関数##############################################################################
  function getDateTime() {
  var d = new Date();
  return d.getFullYear()
		 + '/' + ('0' + (d.getMonth() + 1)).slice(-2)
		 + '/' + ('0' + d.getDate()).slice(-2)
		 + '_' + ('0' + d.getHours()).slice(-2)
		 + ':' + ('0' + d.getMinutes()).slice(-2)
		 + ':' + ('0' + d.getSeconds()).slice(-2);
  }
