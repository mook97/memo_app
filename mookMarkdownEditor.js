var MookMDE = new Object();
MookMDE.addTexts = function(s_text, e_text, col_num, is_start){
/*
*  -- args --
*    s_text: string;
*    e_text: string;
*    col_num: int;
*    is_start: boolean;
*    
*  -- 説明 --
*    カーソル位置にテキスト(`s_text`&`e_text`)を挿入する
*    カーソルが範囲選択の場合は範囲の文字列を一度切り取りし`s_text`と`e_text`の間に切り取った文字列を挿入する
*    `col_num`が指定されていた場合は指定文字数分移動する。(デフォルトは`e_text`をの最後の文字から数えて何文字か)
*    `is_start`が指定されていた場合は`col_nu`の開始位置が`s_text`の初めの文字から数える
*/
  var before_text = this.editor.getSelectedText();
  var b_cursor_start = this.editor.getSelectionRange().start;
  this.editor.onCut();
  this.editor.session.insert(this.editor.getCursorPosition(), s_text + before_text + e_text);
  this.editor.renderer.scrollCursorIntoView()
  var cursor_end = this.editor.getSelectionRange().end;
  if(is_start == true){this.editor.gotoLine(b_cursor_start.row+1, b_cursor_start.column + col_num);} 
  else {this.editor.gotoLine(cursor_end.row+1, cursor_end.column - col_num);}
  this.editor.focus();
}
MookMDE.addText_beginLine = function(s_text, max, blank_line) {
/* 
*  -- args --
*    s_text: string;
*    max: int;
*    blank_line: int;
*  -- 説明 --
*    カーソル行またはカーソルの選択範囲(複数行も可)の行頭に文字列を追加する
*    行頭に`s_text`を挿入し`max`が指定された場合は行頭に`max`分追加したら次を0として再度追加する
*    blank_line=[0,1,2] 0=なし 1=全体の先頭に空行 2=全体の最後に空行 3=1+2の機能(追加する文字列の前後に改行を入れたい場合に使用する)
*    よくわからないけど正規表現での検索方法が悪いので|とかの正規表現記法がすぐ後ろに現れるとうまくいかない(ほかにもいろいろあると思うからばっちりの解決策があらわれるまでは放置する)
*    つまりこの関数はバグが予見されるがバグによる問題より恩恵の方が大きいと思われるのでいったんこのまま放置する。
*/
  var cursor_start = this.editor.getSelectionRange().start;
  var cursor_end = this.editor.getSelectionRange().end;
  this.editor.selection.setRange(new ace.Range(cursor_start.row, 0, cursor_end.row, cursor_end.column)); // 範囲を設定する(各行の行頭から最後までが入るように設定する)
  var before_text = this.editor.getSelectedText();
  var before_arr = before_text.split('\n');
  var after_text = '';
  this.editor.onCut();


  var tmp_rowCount = 0;
  for(var i=0;i<before_arr.length;i++){
    if(before_arr[i].search(new RegExp(s_text))==-1){
      after_text += s_text + ' ' + before_arr[i];
      tmp_rowCount = s_text.length + 1;
    } else if(before_arr[i].search(new RegExp(s_text))==0 && before_arr[i].search(new RegExp(s_text + ' '))<max-1) {
      after_text += s_text + before_arr[i];
      tmp_rowCount = s_text.length;
    } else {
      after_text += before_arr[i].slice(max+ s_text.length +1);
      tmp_rowCount -= max * s_text.length;
    }
    if(i != before_arr.length - 1){
      after_text += '\n';
    }
  }
  if(blank_line==1){after_text = '\n' + after_text;cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
  if(blank_line==2){after_text = after_text + '\n';cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
  if(blank_line==3){after_text = '\n' + after_text + '\n';cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
  this.editor.session.insert(this.editor.getCursorPosition(), after_text);
  this.editor.renderer.scrollCursorIntoView()
  this.editor.selection.setRange(new ace.Range(cursor_start.row, 0, cursor_end.row, cursor_end.column + tmp_rowCount)); // 範囲を設定する(各行の行頭から最後までが入るように設定する)
  this.editor.focus();
}
MookMDE.toolActionNotfound = function() {alert('action not found(MookMDE)')}
MookMDE.toggleBold = function() {this.addTexts('**', '**', 2);}
MookMDE.toggleItalic =           function() {this.addTexts('*', '*', 1);}
MookMDE.toggleStrikethrough =  function(){this.addTexts('~~', '~~', 2);}
MookMDE.toggleHeadingSmaller = function(){this.addText_beginLine('#', 5);}
MookMDE.toggleCodeBlock =      function(){this.addTexts('```\n', '\n```', 3);}
MookMDE.toggleBlockquote =     function(){this.addText_beginLine('>', 10);}
MookMDE.toggleUnorderedList =  function(){this.addText_beginLine('-', 1);}
MookMDE.toggleOrderedList =    function(){this.addText_beginLine('1.', 1);}
MookMDE.drawLink =             function(){this.addTexts('[', ']()', 3);}
MookMDE.drawImage =            function(){this.addTexts('![', ']()', 3);} // $('#imageModal').modal();
MookMDE.drawTable =            function(){this.addTexts('\n|  |  |  |\n|:---:|:---:|:---:|\n| | | |\n| | | |\n', '', 3, true);}
MookMDE.drawHorizontalRule =   function(){this.addTexts('\n***\n', '', 5);}
MookMDE.togglePreview =        function(){
  if(document.getElementById('mook-markdown-disp-ele').classList.contains('hide') || document.getElementById('mook-markdown-disp-ele').classList.contains('side-by-side')){
    // プレビューモード開始
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('side-by-side');
    document.getElementById('mook-markdown-disp-ele').classList.remove('side-by-side');
    document.getElementById('mook-markdown-ediotr-ele').classList.add('hide');
    document.getElementById('mook-markdown-disp-ele').classList.remove('hide');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.side-by-side').classList.remove('active');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.preview').classList.add('active');
  } else {
    // プレビューモード終了
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('side-by-side');
    document.getElementById('mook-markdown-disp-ele').classList.remove('side-by-side');
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('hide');
    document.getElementById('mook-markdown-disp-ele').classList.add('hide');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.side-by-side').classList.remove('active');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.preview').classList.remove('active');
  }
}
MookMDE.toggleSideBySide =     function(){
  if(document.getElementById('mook-markdown-disp-ele').classList.contains('side-by-side')){
    // 分割モード終了
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('hide');
    document.getElementById('mook-markdown-disp-ele').classList.add('hide');
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('side-by-side');
    document.getElementById('mook-markdown-disp-ele').classList.remove('side-by-side');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.preview').classList.remove('active');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.side-by-side').classList.remove('active');
  } else {
    // 分割モード開始
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('hide');
    document.getElementById('mook-markdown-disp-ele').classList.remove('hide');
    document.getElementById('mook-markdown-ediotr-ele').classList.add('side-by-side');
    document.getElementById('mook-markdown-disp-ele').classList.add('side-by-side');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.side-by-side').classList.add('active');
    document.querySelector('#mark > div.mookmarkdown-tools.toolbar > div > span.btn.preview').classList.remove('active');
  }
  this.editor.resize(true);
}
MookMDE.toggleFullScreen =     function(){alert('toggleFullScreen');}
MookMDE.settingTheme_main     = function(theme) {
  if(document.getElementById('mook-markdown-ediotr-setTheme') == null) {
    document.getElementById('mook-markdown-ediotr-ele').classList.add('hide');
    document.getElementById('mook-markdown-disp-ele').classList.add('hide');
    if(document.getElementById('mook-markdown-ediotr-ele').classList.contains('toolbar-vertical')){
      var toolbar_direction = 'toolbar-vertical';
    } else {
      var toolbar_direction = 'toolbar-horizontal';
    }
    var html = '<div id="mook-markdown-ediotr-setTheme" class="text-dark ' + toolbar_direction + '"><h4>White-Theme</h4>'
    for(var i=0; i<this.themes.length; i++){
      if(this.themes[i] == 'ambiance'){
        html += '<hr><h4>Dark-Theme</h4>'
      }
      if(this.themes[i] == 'cobalt'){
        html += '<hr><h4>Blue-Theme</h4>'
      }
      html += '<div onclick="MookMDE.settingTheme_clicked(\'' + 
        this.themes[i] + '\')" id="Editor-theme-' + 
        this.themes[i] + '" class="btn m-2" style="background:#' + 
        this.themes_bgColor[this.themes[i]] + ';color:#'
        + this.themes_fontColor[this.themes[i]] + ';' + '">' + this.themes[i] + '</div>';
    }
    this.element.insertAdjacentHTML('beforeend', 
      html + '</div>'
    );
  } else {
    document.getElementById('mook-markdown-ediotr-ele').classList.remove('hide');
    document.getElementById('mook-markdown-disp-ele').classList.remove('hide');
    var removeEle = document.getElementById("mook-markdown-ediotr-setTheme");
    removeEle.parentNode.removeChild(removeEle);
  }
}
MookMDE.settingTheme_clicked = function(theme) {
  this.editor.setTheme('ace/theme/' + theme);
  document.getElementById('mook-markdown-ediotr-ele').classList.remove('hide');
  document.getElementById('mook-markdown-disp-ele').classList.remove('hide');
  var removeEle = document.getElementById("mook-markdown-ediotr-setTheme");
  removeEle.parentNode.removeChild(removeEle);
  this.element.classList.remove('darkmode');
  this.element.classList.remove('bluemode');
  this.element.classList.remove('whitemode');
  this.element.classList.add(this.themes_mode[theme]);
  document.querySelector('#mook-markdown-disp-ele').style.backgroundColor = '#' + this.themes_bgColor[theme]; // 表示エリアのカラー指定
  document.querySelector('.mookmarkdown-tools.toolbar').style.backgroundColor = '#' + this.themes_bgColor[theme]; // ツールバーのカラー指定
}
MookMDE.default_item_func = {
  'bold'           : 'MookMDE.toggleBold', 
  'italic'         : 'MookMDE.toggleItalic',
  'strikethrough'  : 'MookMDE.toggleStrikethrough',
  'header'         : 'MookMDE.toggleHeadingSmaller',
  'code'           : 'MookMDE.toggleCodeBlock',
  'quote'          : 'MookMDE.toggleBlockquote',
  'list-ul'        : 'MookMDE.toggleUnorderedList',
  'list-ol'        : 'MookMDE.toggleOrderedList',
  'link'           : 'MookMDE.drawLink',
  'image'          : 'MookMDE.drawImage',
  'table'          : 'MookMDE.drawTable',
  'horizontal-rule': 'MookMDE.drawHorizontalRule',
  'preview'        : 'MookMDE.togglePreview',
  'side-by-side'   : 'MookMDE.toggleSideBySide',
  'fullscreen'     : 'MookMDE.toggleFullScreen',
  'guide'          : 'MookMDE.toggleFullScreen',
  'set-theme'      : 'MookMDE.settingTheme_main'
}
MookMDE.initialize = function() {
  // defaultの変数を初期化する
  this.default_tools =   [
    'bold', 'italic', 'strikethrough', 'header', 'line',
    'code', 'quote', 'list-ul', 'list-ol', 'line',
    'link', 'image', 'table', 'horizontal-rule', 'line',
    'preview', 'side-by-side', 'set-theme', 'line',
    'guide'
  ]
  this.default_tool_items_class = {
    'bold'           : 'fa fa-bold', 
    'italic'         : 'fa fa-italic',
    'strikethrough'  : 'fa fa-strikethrough',
    'header'         : 'fa fa-heading',
    'code'           : 'fa fa-code',
    'quote'          : 'fa fa-quote-left',
    'list-ul'        : 'fa fa-list-ul',
    'list-ol'        : 'fa fa-list-ol',
    'link'           : 'fa fa-link',
    'image'          : 'fa fa-image',
    'table'          : 'fa fa-table',
    'horizontal-rule': 'fa fa-minus',
    'preview'        : 'fa fa-eye no-disable',
    'side-by-side'   : 'fa fa-columns no-disable no-mobile',
    'fullscreen'     : 'fa fa-arrows-alt no-disable no-mobile',
    'guide'          : 'fa fa-question-circle',
    'set-theme'      : 'fa fa-sun'
  }
  this.default_tool_title = {
    'bold'           : 'Bold', 
    'italic'         : 'Italic',
    'strikethrough'  : 'Strikethrough',
    'header'         : 'Heading',
    'code'           : 'Code',
    'quote'          : 'Quote',
    'list-ul'        : 'Generic List',
    'list-ol'        : 'Numbered List',
    'link'           : 'Create Link',
    'image'          : 'Insert Image',
    'table'          : 'Insert Table',
    'horizontal-rule': 'Insert Horizontal Line',
    'preview'        : 'Toggle Preview',
    'side-by-side'   : 'Toggle Side by Side',
    'fullscreen'     : 'Toggle Fullscreen',
    'guide'          : 'Markdown Guide',
    'set-theme'      : 'Theme'
  }
  this.themes = [
    'chrome',   'clouds',   'crimson_editor',   'dawn',  'dreamweaver',  'katzenmilch',  'eclipse',  'github',  'iplastic',  'kuroir',  'sqlserver',  'textmate',  'tomorrow',  'xcode',
    'ambiance',  'chaos',  'clouds_midnight',  'dracula',  'gruvbox',  'idle_fingers',  'kr_theme',  'merbivore',  'merbivore_soft',  'mono_industrial',  'monokai',  'pastel_on_dark',  'terminal',  'tomorrow_night',  'tomorrow_night_eighties',  'twilight',  'vibrant_ink',  'gob',
    'cobalt',  'solarized_dark',  'tomorrow_night_blue'
  ]
  
  this.themes_bgColor = {
    'chrome' : 'FFFFFF',   'clouds' : 'FFFFFF',   'crimson_editor' : 'FFFFFF',   'dawn' : 'F9F9F9',  'dreamweaver' : 'FFFFFF',  'katzenmilch' : 'F3F2F3',  'eclipse' : 'FFFFFF',  'github' : 'FFFFFF',  'iplastic' : 'EEEEEE',  'kuroir' : 'E8E9E8',  'sqlserver' : 'FFFFFF',  'textmate' : 'FFFFFF',  'tomorrow' : 'FFFFFF',  'xcode' : 'FFFFFF',
    'ambiance' : '202020',  'chaos' : '161616',  'clouds_midnight' : '191919',  'dracula' : '282A36',  'gruvbox' : '1D2021',  'idle_fingers' : '323232',  'kr_theme' : '0B0A09',  'merbivore' : '161616',  'merbivore_soft' : '1C1C1C',  'mono_industrial' : '222C28',  'monokai' : '272822',  'pastel_on_dark' : '2C2828',  'terminal' : '000000',  'tomorrow_night' : '1D1F21',  'tomorrow_night_eighties' : '2D2D2D',  'twilight' : '141414',  'vibrant_ink' : '0F0F0F',  'gob' : '0B0B0B',  
    'cobalt' : '002240', 'solarized_dark' : '002B36', 'tomorrow_night_blue' : '002451'
  }

  this.themes_fontColor = {
    'chrome' : '0f0f0f',   'clouds' : '0f0f0f',   'crimson_editor' : '0f0f0f',   'dawn' : '0f0f0f',  'dreamweaver' : '0f0f0f',  'katzenmilch' : '0f0f0f',  'eclipse' : '0f0f0f',  'github' : '0f0f0f',  'iplastic' : '0f0f0f',  'kuroir' : '0f0f0f',  'sqlserver' : '0f0f0f',  'textmate' : '0f0f0f',  'tomorrow' : '0f0f0f',  'xcode' : '0f0f0f',
    'ambiance' : 'FFFFFF',  'chaos' : 'FFFFFF',  'clouds_midnight' : 'FFFFFF',  'dracula' : 'FFFFFF',  'gruvbox' : 'FFFFFF',  'idle_fingers' : 'FFFFFF',  'kr_theme' : 'FFFFFF',  'merbivore' : 'FFFFFF',  'merbivore_soft' : 'FFFFFF',  'mono_industrial' : 'FFFFFF',  'monokai' : 'FFFFFF',  'pastel_on_dark' : 'FFFFFF',  'terminal' : 'FFFFFF',  'tomorrow_night' : 'FFFFFF',  'tomorrow_night_eighties' : 'FFFFFF',  'twilight' : 'FFFFFF',  'vibrant_ink' : 'FFFFFF',  'gob' : 'FFFFFF',  
    'cobalt' : 'FFFFFF', 'solarized_dark' : 'FFFFFF', 'tomorrow_night_blue' : 'FFFFFF'
  }
  this.themes_mode = {
    'chrome' : 'whitemode',   'clouds' : 'whitemode',   'crimson_editor' : 'whitemode',   'dawn' : 'whitemode',  'dreamweaver' : 'whitemode',  'katzenmilch' : 'whitemode',  'eclipse' : 'whitemode',  'github' : 'whitemode',  'iplastic' : 'whitemode',  'kuroir' : 'whitemode',  'sqlserver' : 'whitemode',  'textmate' : 'whitemode',  'tomorrow' : 'whitemode',  'xcode' : 'whitemode',
    'ambiance' : 'darkmode',  'chaos' : 'darkmode',  'clouds_midnight' : 'darkmode',  'dracula' : 'darkmode',  'gruvbox' : 'darkmode',  'idle_fingers' : 'darkmode',  'kr_theme' : 'darkmode',  'merbivore' : 'darkmode',  'merbivore_soft' : 'darkmode',  'mono_industrial' : 'darkmode',  'monokai' : 'darkmode',  'pastel_on_dark' : 'darkmode',  'terminal' : 'darkmode',  'tomorrow_night' : 'darkmode',  'tomorrow_night_eighties' : 'darkmode',  'twilight' : 'darkmode',  'vibrant_ink' : 'darkmode',  'gob' : 'darkmode',  
    'cobalt' : 'bluemode', 'solarized_dark' : 'bluemode', 'tomorrow_night_blue' : 'bluemode'
  }
}

MookMDE.toolbar_vertical = function (ele, tools){
  var html = '<div>';
  var tag_str_start = '<span onclick="';
  var tag_str_end = '"></i></span>';
  for(var i=0; i<this.toolitems.length; i++){
    if(this.toolitems[i]['name'] == 'line'){
      html += this.toolbar_line;
    } else if(this.toolitems[i]['name'] == 'guide') {
      html += '<a class="btn text-center pl-0 pr-0" href="https://simplemde.com/markdown-guide" target="_blank"><i class="fa fa-question-circle"></i></a>';
    } else {
      html += tag_str_start + this.default_item_func[this.toolitems[i]['name']] + '()" class="btn text-center pl-0 pr-0 ' +
        this.toolitems[i]['name'] + '" title="' + 
        this.toolitems[i]['title'] + '"><i class="' + 
        this.toolitems[i]['className'] + tag_str_end;
    }
  }
  html += '</div>';
  this.element.querySelector('.toolbar').insertAdjacentHTML('beforeend', html);
}

MookMDE.htmlInitialize = function(){
  this.element.insertAdjacentHTML('beforeend', '<div class="mookmarkdown-tools toolbar toolbar-' + this.toolbar_direction + '"></div><div id="mook-markdown-ediotr-ele" class="toolbar-' + this.toolbar_direction + '"></div><div id="mook-markdown-disp-ele" class="hide toolbar-' + this.toolbar_direction + '"><div></div></div>');
  this.editor = ace.edit("mook-markdown-ediotr-ele"); 
  this.editor.setTheme("ace/theme/" + this.theme);
  this.editor.getSession().setMode("ace/mode/markdown");
  this.editor.setAutoScrollEditorIntoView(true);
  this.editor.setFontSize(14)
  this.editor.resize(true);
  this.element.classList.add(this.themes_mode[this.theme]);
  document.querySelector('#mook-markdown-disp-ele').style.backgroundColor = '#' + this.themes_bgColor[this.theme]; // 表示エリアのカラー指定
  document.querySelector('.mookmarkdown-tools.toolbar').style.backgroundColor = '#' + this.themes_bgColor[this.theme]; // ツールバーのカラー指定
  this.toolbar_vertical();
  this.editor.getSession().on("change" , function(e){
    document.querySelector('#mook-markdown-disp-ele > div').innerHTML = marked(MookMDE.editor.getValue()); // getValueはオブジェクトを指定しないとダメ見たい
  });
}


MookMDE.create = function(args){
  this.initialize();
  this.toolitems = [];  // default-toolbar-items
  this.theme = 'xcode'; // default-theme
  this.toolbar_direction = 'horizontal'; // default-toolbar_direction
  this.toolbar_line = '<span class="toolbar-line"></span>'; // toolbar line html
  if(args.element!=undefined){this.element = document.getElementById(args.element);}
  if(args.toolbar_direction=='horizontal' || args.toolbar_direction=='vertical'){this.toolbar_direction = args.toolbar_direction;} 
  if(this.themes.indexOf(args.theme) != -1){this.theme = args.theme;} 

  // デフォルトのツールアイテムの場合
  for(var i=0;i<this.default_tools.length;i++){
    this.toolitems[i] = {
      'name': this.default_tools[i], 
      'action':this.default_item_func[this.default_tools[i]], 
      'className':this.default_tool_items_class[this.default_tools[i]], 
      'title': this.default_tool_title[this.default_tools[i]]
    };
  }

  // toolを追加する
  if(args.toolbar!=undefined &&  Array.isArray(args.toolbar) && args.toolbar.length > 0){
    /* 
    *  取り敢えず配列であることと0より多いことを確認して処理へ進む
    *  配列の中で許可されるデータは`this.default_tools`ないにある文字列と同一か
    *  または`name`と`action`と`className`と`title`を指定した連想配列です。
    *  連想配列の中で指定するが強制となるのは`name`と`action`です。
    *  `name`は要素の名前ですが特にユーザ側が意識することはないです。
    *  `action`は呼び出す関数を文字列名で指定してください。文字列名で指定する理由はonclickイベントで呼び出すようにするためです。
    *  またonclickイベント呼び出すためglobalで関数宣言をしていないと関数が見つからずエラーとなります。
    *  `class`を指定しなかった場合はデフォルト値:`fas fa-cat`が指定されます。
    *  `title`を指定しなかった場合はnameをタイトルとして使用します。
    */
    var tmp_toolitems = []; // 一時変数を作成して完成後にオブジェクト変数に格納する
    for(var i=0; i<args.toolbar.length; i++){
      tool = args.toolbar[i];
      if(typeof(tool) == 'string' || this.default_tools.indexOf(tool) != -1){
        tmp_toolitems.push({
          'name'     : tool, 
          'action'   :this.default_item_func[tool], 
          'className':this.default_tool_items_class[tool], 
          'title'    : this.default_tool_title[tool]
        });
      } else if(typeof(tool.name) == 'string' && tool.name != '' && typeof(tool.action) == 'string' && tool.action != '') {
        var tmp_toolClass = 'fas fa-cat' // classのデフォルト値 
        var tmp_toolTitle = tool.name // actionのデフォルト値
        if(typeof(tool.class)=='string' && tool.class != ''){tmp_toolClass = tool.class}
        if(typeof(tool.title)=='title' && tool.title != ''){tmp_toolTitle = tool.title}
        this.default_item_func[tool.name] = tool.action;
        console.log(tool)
        tmp_toolitems.push({
          'name'     : tool.name, 
          'action'   : tool.action, 
          'className': tmp_toolClass, 
          'title'    : tmp_toolTitle
        });
      }
    }
    this.toolitems = tmp_toolitems;
  }

  if(this.element!=undefined){this.htmlInitialize();} // 唯一指定が強制なのは要素を展開するElementのIDのみ{'element': 'target'}
}

window.addEventListener('DOMContentLoaded', function() {
  var my_mark = MookMDE.create({
    'element' : 'mark',
    'toolbar_direction': 'horizontal',
    'theme': 'solarized_dark'
  });
});