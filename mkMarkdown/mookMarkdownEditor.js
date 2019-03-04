/**
* mkMDE - markdown and asciidoc editor
* Copyright(c) 2019, Mook.(MIT Licensed)
*
* Includes marked - a markdown parser
* Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
* https://github.com/markedjs/marked
*
* Includes ace - Text Editor
* Copyright (c) 2010, Ajax.org B.V.
* All rights reserved.
* 
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of Ajax.org B.V. nor the
*       names of its contributors may be used to endorse or promote products
*       derived from this software without specific prior written permission.
* 
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
* Date: 2019-03-01 
*/

// https://www.catch.jp/oss-license/2013/10/27/jquery-license/



(function(global) {
  "use strict";
  var MookMDE = function(args){
    // defaultの変数を初期化する
    // default_toolsは配列の順番でそのまま表示されます
    var _this = this;

    _this.addTexts = function(s_text, e_text, col_num, is_start){
      /**
      *  function:MookMDE.addTexts
      *   -- args --
      *     s_text: string;
      *     e_text: string;
      *     col_num: int;
      *     is_start: boolean;
      *     
      *   -- 説明 --
      *     カーソル位置にテキスト(`s_text`&`e_text`)を挿入する
      *     カーソルが範囲選択の場合は範囲の文字列を一度切り取りし`s_text`と`e_text`の間に切り取った文字列を挿入する
      *     `col_num`が指定されていた場合は指定文字数分移動する。(デフォルトは`e_text`をの最後の文字から数えて何文字か)
      *     `is_start`が指定されていた場合は`col_nu`の開始位置が`s_text`の初めの文字から数える
      */
      var before_text = _this.editor.getSelectedText();
      var b_cursor_start = _this.editor.getSelectionRange().start;
      _this.editor.onCut();
      _this.editor.session.insert(_this.editor.getCursorPosition(), s_text + before_text + e_text);
      _this.editor.renderer.scrollCursorIntoView()
      var cursor_end = _this.editor.getSelectionRange().end;
      if(is_start == true){_this.editor.gotoLine(b_cursor_start.row+1, b_cursor_start.column + col_num);} 
      else {_this.editor.gotoLine(cursor_end.row+1, cursor_end.column - col_num);}
      _this.editor.focus();
    } 

    _this.addText_beginLine = function(s_text, max, blank_line) {
      /** 
      *  -- args --
      *    s_text: string;
      *    max: int;
      *    blank_line: int;
      *  -- 説明 --
      *    カーソル行またはカーソルの選択範囲(複数行も可)の行頭に文字列を追加する
      *    行頭に`s_text`を挿入し`max`が指定された場合は行頭に`max`分追加したら次を0として再度追加する
      *    blank_line=[0,1,2] 0=なし 1=全体の先頭に空行 2=全体の最後に空行 3=1+2の機能(追加する文字列の前後に改行を入れたい場合に使用する)
      */
      var cursor_start = _this.editor.getSelectionRange().start;
      var cursor_end   = _this.editor.getSelectionRange().end;
      _this.editor.selection.setRange(new ace.Range(cursor_start.row, 0, cursor_end.row, cursor_end.column)); /** 範囲を設定する(各行の行頭から最後までが入るように設定する) */
      var before_text = _this.editor.getSelectedText();
      var before_arr = before_text.split('\n');
      var after_text = '';
      _this.editor.onCut();
      var tmp_colCount = 0;
      for(var i=0;i<before_arr.length;i++){
        if(before_arr[i].search(new RegExp(s_text))==-1){
          after_text += s_text + ' ' + before_arr[i];
          tmp_colCount = s_text.length + 1;
        } else if(before_arr[i].search(new RegExp(s_text))==0 && before_arr[i].search(new RegExp(s_text + ' '))<max-1) {
          after_text += s_text + before_arr[i];
          tmp_colCount = s_text.length;
        } else {
          after_text += before_arr[i].slice(max + s_text.length);
          tmp_colCount -= max * s_text.length;
        }
        if(i != before_arr.length - 1){
          after_text += '\n';
        }
      }
      if(blank_line==1){after_text = '\n' + after_text;cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
      if(blank_line==2){after_text = after_text + '\n';cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
      if(blank_line==3){after_text = '\n' + after_text + '\n';cursor_start.row=cursor_start.row+1;cursor_end.row=cursor_end.row+1;}
      _this.editor.session.insert(_this.editor.getCursorPosition(), after_text);
      _this.editor.renderer.scrollCursorIntoView()
      _this.editor.selection.setRange(new ace.Range(cursor_start.row, 0, cursor_end.row, cursor_end.column + tmp_colCount)); /**範囲を設定する(各行の行頭から最後までが入るように設定する) */
      _this.editor.focus();
    }

    _this.modal_show = function(html, className){
      var modal = _this.element.querySelector('.mook-markdown-ele .mook-modal');
      var overlay = _this.element.querySelector('.mook-markdown-ele .overlay');
      if(modal != undefined && overlay != undefined){
        modal.style.display = 'block';
        overlay.style.display = 'block';
        if(html != undefined && typeof(html) == 'string'){
          _this.element.querySelector('.mook-markdown-ele .mook-modal > .mook-modal-content').insertAdjacentHTML('beforeend', html);
        }
        if(className != undefined && typeof(className) == 'string'){
          _this.element.querySelector('.mook-markdown-ele .mook-modal > .mook-modal-content').classList.add(className);
        }
      }
    }
    _this.modal_close = function(){
      var close = _this.element.querySelector('.mook-modal-close')
      var modal = _this.element.querySelector('.mook-markdown-ele .mook-modal');
      var modal_content = _this.element.querySelector('.mook-markdown-ele .mook-modal .mook-modal-content');
      var overlay = _this.element.querySelector('.mook-markdown-ele .overlay');
      var closed = function(){
        modal.style.display = 'none';
        overlay.style.display = 'none';
        _this.classReset(modal_content, 'mook-modal-content')
        modal_content.innerHTML = '';
      }
      if(close != undefined && modal != undefined && overlay != undefined && modal_content != undefined){
        close.addEventListener('click', function(e){
          e.stopPropagation();
          closed();
        }, false)
        overlay.addEventListener('click', function(e){
          e.stopPropagation();
          closed();
        }, false)
      }
    }

    _this.classAllRemove = function(ele){
      /**すべてのクラスを削除する */
      if(ele != undefined && typeof(ele) == 'object' && ele.nodeType == 1){
        var classList = ele.classList.value.split(' ');
        for(var i=0;i<classList.length;i++){
          ele.classList.remove(classList[i]);
        }
      }
    }
    _this.classReset = function(ele, cls){
      /**一部のクラスのみ再度設定して他は削除する */
      /**args: cls:設定するクラスを半角スペースで設定する */
      if(ele != undefined && typeof(ele) == 'object' && ele.nodeType == 1 && (typeof(cls)==undefined || typeof(cls)=='string')){
        var classList = ele.classList.value.split(' ');
        var class_arr = typeof(cls)=='string' ? cls.split(' ') : [];
        for(var i=0;i<classList.length;i++){
          if(class_arr.indexOf(classList[i])==-1){
            ele.classList.remove(classList[i]);
          }
        }
      }
    }

    _this.sleep = function(wait, callback){
      var sleeping = 0;
      var timer = setInterval(function(){
        sleeping ++;
        if(sleeping >= wait){
            clearInterval(timer);
            if(callback != undefined && typeof(callback)) callback();
        }
      }, 1000);
    }

    _this.toolActionNotfound = function() {alert('action not found(MookMDE)');};
    _this.toggleBold =           function() {_this.addTexts('**', '**', 2);     _this.toggleBold_extended();};
    _this.toggleItalic =         function() {_this.addTexts('*', '*', 1);       _this.toggleItalic_extended();};
    _this.toggleStrikethrough =  function(){_this.addTexts('~~', '~~', 2);      _this.toggleStrikethrough_extended();};
    _this.toggleHeadingSmaller = function(){_this.addText_beginLine('#', 5);    _this.toggleHeadingSmaller_extended();};
    _this.toggleCodeBlock =      function(){_this.addTexts('```\n', '\n```', 3);_this.toggleCodeBlock_extended();};
    _this.toggleBlockquote =     function(){_this.addText_beginLine('>', 10);   _this.toggleBlockquote_extended();};
    _this.toggleUnorderedList =  function(){_this.addText_beginLine('-', 1);    _this.toggleUnorderedList_extended();};
    _this.toggleOrderedList =    function(){_this.addText_beginLine('1.', 1);   _this.toggleOrderedList_extended();};
    _this.drawLink =             function(){_this.addTexts('[', ']()', 3);      _this.drawLink_extended();};
    _this.drawImage =            function(){_this.addTexts('![', ']()', 3);     _this.drawImage_extended();}; /**$('#imageModal').modal(); */
    _this.drawTable =            function(){_this.addTexts('\n|  |  |  |\n|:---:|:---:|:---:|\n| | | |\n| | | |\n', '', 3, true);_this.drawTable_extended();};
    _this.drawHorizontalRule =   function(){_this.addTexts('\n***\n', '', 5);   _this.drawHorizontalRule_extended();};
    _this.undo = function(){_this.editor.undo();_this.undo_extended();};
    _this.redo = function(){_this.editor.redo();_this.redo_extended();};
    _this.togglePreview =        function(){
      if(_this.dispEle.classList.contains('hide') || _this.dispEle.classList.contains('side-by-side')){
        /**プレビューモード開始 */
        _this.editorEle.classList.remove('side-by-side');
        _this.editorEle.classList.add('hide');
        _this.dispEle.classList.remove('side-by-side');
        _this.dispEle.classList.remove('hide');
        _this.toolbarEle.querySelector('div > a.btn.side-by-side').classList.remove('active');
        _this.toolbarEle.querySelector('div > a.btn.preview').classList.add('active');
      } else {
        /**プレビューモード終了 */
        _this.editorEle.classList.remove('side-by-side');
        _this.editorEle.classList.remove('hide');
        _this.dispEle.classList.remove('side-by-side');
        _this.dispEle.classList.add('hide');
        _this.toolbarEle.querySelector('div > a.btn.side-by-side').classList.remove('active');
        _this.toolbarEle.querySelector('div > a.btn.preview').classList.remove('active');
      }
      _this.togglePreview_extended();
    };

    _this.toggleSideBySide =     function(){
      if(_this.dispEle.classList.contains('side-by-side')){
        /**分割モード終了 */
        _this.editorEle.classList.remove('hide');
        _this.dispEle.classList.add('hide');
        _this.editorEle.classList.remove('side-by-side');
        _this.dispEle.classList.remove('side-by-side');
        _this.toolbarEle.querySelector('div > a.btn.preview').classList.remove('active');
        _this.toolbarEle.querySelector('div > a.btn.side-by-side').classList.remove('active');
      } else {
        /**分割モード開始 */
        _this.editorEle.classList.remove('hide');
        _this.dispEle.classList.remove('hide');
        _this.editorEle.classList.add('side-by-side');
        _this.dispEle.classList.add('side-by-side');
        _this.toolbarEle.querySelector('div > a.btn.side-by-side').classList.add('active');
        _this.toolbarEle.querySelector('div > a.btn.preview').classList.remove('active');
      }
      _this.editor.resize(true);
      _this.toggleSideBySide_extended();
    };



    _this.toggleFullScreen =     function(){
      _this.element.classList.add('fullscreen');
      document.querySelector('body').style.overflow = 'hidden';
      _this.toggleFullScreen_extended();
    };
    _this.toggleNormalScreen = function(){
      _this.element.classList.remove('fullscreen');
      document.querySelector('body').style.overflow = 'auto';
      _this.toggleFullScreen_extended();
    }

    _this.settingTheme_main     = function() {
      if(_this.element.querySelector('.mook-markdown-ediotr-setTheme') == null) {
        _this.editorEle.classList.add('mook-markdown-ediotr-setTheme-hide');
        _this.dispEle.classList.add('mook-markdown-ediotr-setTheme-hide');
        _this.toolbarEle.querySelector('div > a.btn.set-theme').classList.add('active');
  
        if(_this.editorEle.classList.contains('toolbar-vertical')){
          var toolbar_direction = 'toolbar-vertical';
        } else {
          var toolbar_direction = 'toolbar-horizontal';
        }
        var html = '<div class="mook-markdown-ediotr-setTheme text-dark ' + toolbar_direction + '"><h4>White-Theme</h4>'
        for(var i=0; i<_this.themes.length; i++){
          if(_this.themes[i] == 'ambiance'){
            html += '<hr><h4>Dark-Theme</h4>'
          }
          if(_this.themes[i] == 'cobalt'){
            html += '<hr><h4>Blue-Theme</h4>'
          }
          html += '<div theme="' + _this.themes[i] +'" class="btn m-2 theme-sel-btn Editor-theme-' + _this.themes[i] +'" style="background:#' + 
          _this.themes_bgColor[_this.themes[i]] + ';color:#'
            + _this.themes_fontColor[_this.themes[i]] + ';' + '">' + _this.themes[i] + '</div>';
        }
        _this.element.insertAdjacentHTML('beforeend', 
          html + '<div class="btn theme-sel-btn">aaa</div' + '</div>'
        );

        var theme_eles = _this.element.querySelectorAll('.btn.theme-sel-btn');
        for(var i=0; i<theme_eles.length; i++){
          theme_eles[i].addEventListener('click', function(){
            if(_this.themes.indexOf(this.getAttribute('theme')) != -1){
              _this.settingTheme_clicked(this.getAttribute('theme'));
            }
          }, false);
        }

      } else {
        _this.editorEle.classList.remove('mook-markdown-ediotr-setTheme-hide');
        _this.dispEle.classList.remove('mook-markdown-ediotr-setTheme-hide');
        _this.toolbarEle.querySelector('div > a.btn.set-theme').classList.remove('active');
        var removeEle = _this.element.querySelector(".mook-markdown-ediotr-setTheme");
        removeEle.parentNode.removeChild(removeEle);
      }
      _this.settingTheme_main_extended();
    };


    _this.settingTheme_clicked = function(theme) {
      _this.editor.setTheme('ace/theme/' + theme);
      _this.editorEle.classList.remove('mook-markdown-ediotr-setTheme-hide');
      _this.dispEle.classList.remove('mook-markdown-ediotr-setTheme-hide');

      if(_this.toolbarEle.querySelector('div > a.btn.set-theme')){
        _this.toolbarEle.querySelector('div > a.btn.set-theme').classList.remove('active');
      }
      var removeEle = document.getElementById("mook-markdown-ediotr-setTheme");
      if(removeEle!=undefined){removeEle.parentNode.removeChild(removeEle);}
      _this.element.classList.remove('darkmode');
      _this.element.classList.remove('bluemode');
      _this.element.classList.remove('whitemode');
      _this.element.classList.remove('editor_theme-' + _this.theme); /**themeを削除する */
      _this.theme = theme; // 現在のテーマを設定する
      _this.element.classList.add(_this.themes_mode[theme]);
      _this.element.classList.add('editor_theme-' + theme);
      _this.dispEle.style.backgroundColor = '#' + _this.themes_bgColor[theme]; /**表示エリアのカラー指定 */
      _this.toolbarEle.style.backgroundColor = '#' + _this.themes_bgColor[theme]; /**ツールバーのカラー指定 */
      _this.settingTheme_clicked_extended();
    };

    _this.toolbar_create = function (ele, tools){
      var html = '<div class="tool-items-cls">';
      var base_tag_str_start = '<a class="btn text-center pl-0 pr-0 ';
      var tag_str_end = '"></i></a>';
      for(var i=0; i<_this.toolitems.length; i++){
        if(_this.toolitems[i]['className'] != undefined && _this.toolitems[i]['className'].split(' ').indexOf('no-mobile') != -1){
          var tag_str_start = base_tag_str_start + 'no-mobile ';
        } else {
          var tag_str_start = base_tag_str_start;
        }

        if(_this.toolitems[i]['name'] == 'line'){
          html += _this.toolbar_line;
        } else if(_this.toolitems[i]['name'] == 'guide') {
          html += tag_str_start + _this.toolitems[i]['name'] + '" href="https://simplemde.com/markdown-guide" target="_blank" title="' + this.toolitems[i]['title'] + '"><i class="fa fa-question-circle"></i></a>';
        } else if(_this.tool_listTypeItems.indexOf(_this.toolitems[i]['name']) != -1){
          var list_items = _this.tool_listTypeItems_data[_this.toolitems[i]['name']];
          html += tag_str_start +
          _this.toolitems[i]['name']  + ' list-items-group" title="' + 
          _this.toolitems[i]['title'] + '"><i class="' + 
          _this.toolitems[i]['className'] + '"></i>' + 
          '<div class="tool-list-items" style="display:none;">';
          
          for(var list_item=0; list_item < list_items.length; list_item++){
            if(list_items[list_item]['icon'] != undefined){
              html += '<p class="' + list_items[list_item]['class'] + '" title="' + list_items[list_item]['text'] + '"><i class="' + list_items[list_item]['icon'] + '"></i> ' + list_items[list_item]['text'] + '</p>';
            } else {
              html += '<p class="' + list_items[list_item]['class'] + '" title="' + list_items[list_item]['text'] + '">' + list_items[list_item]['text'] + '</p>';
            }
          }
  
          html += '</div></a>';
        } else {
          html += tag_str_start +
            _this.toolitems[i]['name'] + '" title="' + 
            _this.toolitems[i]['title'] + '"><i class="' + 
            _this.toolitems[i]['className'] + tag_str_end;
        }
      }
      html += '</div>';
      _this.element.querySelector('.toolbar').insertAdjacentHTML('beforeend', html);
      _this.toolbarEle = _this.element.querySelector('div.mookmarkdown-tools.toolbar');  /**変数化しておく */
  

      for (var i=0;i<_this.toolitems.length;i++){
        /**key Eventを追加する */
        var key = _this.toolitems[i].name;
        var tarEle = _this.toolbarEle.querySelector('div > a.' + key);
        if(tarEle!=undefined){
          tarEle.addEventListener('click', _this.tool_items_func[key], false);
        }
      }


      _this.previewFile = function () {
        var ele     = _this.element.querySelector('.MookMDE_File_Input_DOM');
        var file    = ele.files[0];
        var reader = new FileReader();
        reader.addEventListener('load', function() {
          document.querySelector('div.mookmarkdown-tools.toolbar > div > a.btn.image.list-items-group > div.tool-list-items').insertAdjacentHTML('beforeend', '<p class="mookMDE_File_DATA_Item" file_name="' + file.name + '" value="'+ reader.result+'"><i class="mook-image-trash fas fa-trash-alt"></i> ' + file.name + '</p>')
          var fileDatas = document.querySelectorAll('div.mookmarkdown-tools.toolbar > div > a.btn.image.list-items-group > div.tool-list-items > p.mookMDE_File_DATA_Item');
          var file_number = fileDatas.length-1;
          var pattern = new RegExp('(!\\['+escapeRegExp(file.name) +'\\]\\('+ file_number +'\\))','g')
          _this.addTexts('!['+file.name, ']('+file_number+')', 0);
          document.querySelector('#mark > div.mookmarkdown-tools.toolbar.toolbar-horizontal > div > a.btn.text-center.pl-0.pr-0.image.list-items-group > div > p:nth-child('+(fileDatas.length+2)+') > i.mook-image-trash').addEventListener('click', function(e){
            e.stopPropagation();
            var before = _this.editor.getValue(); // bafore data
            var after  = data.replace(pattern, '')  // after data
            var cursor_start = _this.editor.getSelectionRange().start;
            var cursor_end   = _this.editor.getSelectionRange().end;
            _this.editor.setValue(after);
            // MookMDE.editor.gotoLine(cursor_start, cursor_start);
            var tarEle = document.querySelector('#mark > div.mookmarkdown-tools.toolbar.toolbar-horizontal > div > a.btn.text-center.pl-0.pr-0.image.list-items-group > div > p:nth-child('+(fileDatas.length+2)+')')
            tarEle.style.display = 'none';
          });
        }, false);
        if(file) {reader.readAsDataURL(file);}
        ele.parentNode.removeChild(ele); 
      }
      /**image_link追加_1 */
      var tarEle = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.toggleimagelink')
      if(tarEle){
        tarEle.addEventListener('click', function(e){
          e.stopPropagation();
          _this.modal_show('<h3>Add Image</h3><input class="name" placeholder="image name(alt)" value="" spellcheck="false"/><input class="url" placeholder="image link(url)" value="" spellcheck="false"/><button class="btn cancel">Cancel</button><button class="btn add">Add</button>', 'image-link-add');
          _this.element.querySelector('div.mook-modal > div > button.btn.add').addEventListener('click', function(){
            var name = _this.element.querySelector('div.mook-modal > div > input.name').value;
            var url  = _this.element.querySelector('div.mook-modal > div > input.url').value;
            _this.addTexts('![' + name, ']('+url+')', 2);
            _this.element.querySelector('.mook-markdown-ele .overlay').click();
          }, false);
          _this.element.querySelector('div.mook-modal > div > button.btn.cancel').addEventListener('click', function(){
            _this.element.querySelector('.mook-markdown-ele .overlay').click();
          }, false);
        });
      }
      /**image_link追加_2 */
      var uploadimage = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.uploadimage')
      if(uploadimage){
        uploadimage.addEventListener('click', function(e){
          e.stopPropagation();
          if(uploadimage.querySelector('.MookMDE_File_Input_DOM') == undefined){
            uploadimage.insertAdjacentHTML('beforeend', '<input class="MookMDE_File_Input_DOM" style="display:none;" type="file"">')
            uploadimage.querySelector('.MookMDE_File_Input_DOM').addEventListener('click', function(){
              _this.previewFile();
            }, false);
            uploadimage.querySelector('.MookMDE_File_Input_DOM').click();
          }
        });
      }

      /**Image追加_3 */
      _this.testss = function(){alert('testsssss')}
      var tarEle = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.pastImage');
      if(tarEle){
        tarEle.addEventListener('click', function(e){
          e.stopPropagation();
          this.setAttribute('contenteditable', 'true');
          this.innerHTML = 'Ctrl + v';
          this.focus();
        });
        tarEle.onblur = function(){
          this.innerHTML = '<i class="fas fa-link"></i> Past Image'
        }
        
        if(_this.browser_name() == 'Chrome') {
          tarEle.addEventListener("paste", function(e){
            if (!e.clipboardData || !e.clipboardData.types || (e.clipboardData.types.length != 1) || (e.clipboardData.types[0] != "Files")) { return true; }
            var imageFile = e.clipboardData.items[0].getAsFile();
            var reader = new FileReader();
            reader.addEventListener('load', function(e){
              var base64 = e.target.result;
              var list_items = document.querySelector('div.mookmarkdown-tools.toolbar > div > a.btn.image.list-items-group > div.tool-list-items');
              list_items.insertAdjacentHTML('beforeend', '<p class="mookMDE_File_DATA_Item" file_name="" value="'+ base64+'"><i class="mook-image-trash fas fa-trash-alt"></i></p>')
              var fileDatas = list_items.querySelectorAll('p.mookMDE_File_DATA_Item');
              var file_number = fileDatas.length-1;
              _this.addTexts('!['+'-', ']('+file_number+')', 0);
              var fileNum = fileDatas.length+3;
              // 削除用のイベント
              _this.element.querySelector('a.btn.image.list-items-group > div > p:nth-child('+fileNum+') > i.mook-image-trash').addEventListener('click', function(e){
                e.stopPropagation();
                var pattern = new RegExp('(!\\['+escapeRegExp('-') +'\\]\\('+ file_number +'\\))','g')
                var after  = _this.editor.getValue().replace(pattern, '')  // after data
                _this.editor.setValue(after);
                var tarEle = _this.element.querySelector('a.btn.image.list-items-group > div > p:nth-child('+fileNum+')')
                tarEle.style.display = 'none';
              }, false);
            },false);
            reader.readAsDataURL(imageFile);
            this.innerHTML = "paste image here";
          });
        } else {
          tarEle.addEventListener("input", function(e){
            var temp = document.createElement("div");
            temp.innerHTML = this.innerHTML;
            var pastedImage = temp.querySelector("img");
            if (pastedImage) { 
              var base64 = pastedImage.src;
              var list_items = document.querySelector('div.mookmarkdown-tools.toolbar > div > a.btn.image.list-items-group > div.tool-list-items');
              list_items.insertAdjacentHTML('beforeend', '<p class="mookMDE_File_DATA_Item" file_name="" value="'+ base64+'"><i class="mook-image-trash fas fa-trash-alt"></i></p>')
              var fileDatas = list_items.querySelectorAll('p.mookMDE_File_DATA_Item');
              var file_number = fileDatas.length-1;
              _this.addTexts('!['+'-', ']('+file_number+')', 0);
              var fileNum = fileDatas.length+3;
              // 削除用のイベント
              _this.element.querySelector('a.btn.image.list-items-group > div > p:nth-child('+fileNum+') > i.mook-image-trash').addEventListener('click', function(e){
                e.stopPropagation();
                var pattern = new RegExp('(!\\['+escapeRegExp('-') +'\\]\\('+ file_number +'\\))','g')
                var after  = _this.editor.getValue().replace(pattern, '')  // after data
                _this.editor.setValue(after);
                var tarEle = _this.element.querySelector('a.btn.image.list-items-group > div > p:nth-child('+fileNum+')')
                tarEle.style.display = 'none';
              }, false);
            }
            this.innerHTML = "paste image here";
          })
        }
      }

      /**table追加_2 */
      var tarEle = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.drawtable_x_x');
      if(tarEle){
        tarEle.addEventListener('click', function(e){
          e.stopPropagation();
          var html = '<div class="mk-table-select-tool"><div class="mk-table-cells"><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span><span class="mk-cell"></span></div></div>' 
          var table_tool = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.drawtable_x_x .mk-table-select-tool');
          
          if(table_tool == undefined){
            this.insertAdjacentHTML('beforeend', html);
            var cells = document.querySelectorAll('.mk-table-cells span')
            document.querySelector('.mk-table-cells').addEventListener('mouseleave', function(){
              for(var i=0; i<cells.length;i++){cells[i].classList.remove('mk-state-selected');}
            }, false);
            for(var i=0; i<cells.length;i++){

              cells[i].addEventListener('mouseenter', function(){
                var cells = this.parentNode.querySelectorAll('span.mk-cell')
                var number = Array.prototype.indexOf.call(cells, this)
                var y_range = parseInt(number / 8, 10);
                var x_range = number % 8;
                for(var j=0;j<cells.length;j++){
                  if(parseInt(j / 8, 10) <= y_range && (j % 8) <= x_range){cells[j].classList.add('mk-state-selected');} else {cells[j].classList.remove('mk-state-selected');}
                }
              }, false);
          
              cells[i].addEventListener('click', function(){
                var cells = this.parentNode.querySelectorAll('span.mk-cell')
                var number = Array.prototype.indexOf.call(cells, this)
                var y_range = parseInt(number / 8, 10);
                var x_range = number % 8;
                console.log({'row': y_range+1, 'col': x_range+1});
                var add_text   = '|' + '|'.repeat(x_range+1) + '\n';
                if(y_range+1 > 1){
                  add_text += '|' + ':---:|'.repeat(x_range+1) + '\n';
                  add_text += ('|' + '|'.repeat(x_range+1) + '\n').repeat(y_range);
                }
                _this.addTexts(add_text, '', 3, true);
              }, false);
            }
          } else {
            // 表示中なら消す
            table_tool.parentNode.removeChild(table_tool);
          }
        });
      }

      /**table追加_3 */
      var tarEle = _this.toolbarEle.querySelector('div > a.btn.list-items-group > div.tool-list-items p.drawtable_excel')
      if(tarEle){
        tarEle.addEventListener('click', function(e){
          e.stopPropagation();
          _this.modal_show('<textarea class="excel-data" style="width: 100%;height: 140px;border: solid 1px #939393;"></textarea><button class="btn cancel">Cancel</button><button class="btn add">Add</button>', 'image-link-add');
          _this.element.querySelector('div.mook-modal > div > button.btn.add').addEventListener('click', function(){
            var val = _this.element.querySelector('textarea.excel-data').value;
            var result = '';
            var row = val.split(/\n/g);
            for(var i=0;i<row.length;i++){
              var col = row[i].split(/\t/g);
              if(col.length > 0){
                result += '|';
                for(var j=0;j<col.length;j++){
                  result += col[j] + '|';
                }
                result += '\n';
                if(i==0){
                  result += '|' + ':---:|'.repeat(col.length) + '\n';
                }
              }
            }
            _this.element.querySelector('.mook-markdown-ele .overlay').click();
            _this.addTexts(result, '', 0);
          }, false)
          _this.element.querySelector('div.mook-modal > div > button.btn.cancel').addEventListener('click', function(){
            _this.element.querySelector('.mook-markdown-ele .overlay').click();
          }, false);
          _this.element.querySelector('textarea.excel-data').addEventListener('keydown', function (e) {
            var elem, end, start, value;
            if (e.keyCode === 9) {
              if (e.preventDefault) {
                e.preventDefault();
              }
              elem = e.target;
              start = elem.selectionStart;
              end = elem.selectionEnd;
              value = elem.value;
              elem.value = "" + (value.substring(0, start)) + "\t" + (value.substring(end));
              elem.selectionStart = elem.selectionEnd = start + 1;
              return false;
            }
          });
        });
      }



      _this.modal_close();
      _this.toolbar_create_end_extend();
    };
  
  
    _this.htmlInitialize = function(){
      _this.element.insertAdjacentHTML('beforeend', '<div class="overlay"></div><div class="mook-modal"><p style="margin:0;width: 100%; text-align: right;"><a class="mook-modal-close" class="btn button-link"><i class="fas fa-times"></i></a></p><div class="mook-modal-content"></div></div>')
      if(_this.toolbar_position=='top' || _this.toolbar_position=='left'){
        _this.element.insertAdjacentHTML('beforeend', '<div class="mookmarkdown-tools toolbar toolbar-' + _this.toolbar_direction + '"></div><div id="" class="mook-markdown-editor-ele toolbar-' + _this.toolbar_direction + '"></div><div id="" class="mook-markdown-disp-ele hide toolbar-' + _this.toolbar_direction + '"><div></div></div>');
      } else {
        _this.element.insertAdjacentHTML('beforeend', '<div id="" class="mook-markdown-editor-ele toolbar-' + _this.toolbar_direction + '"></div><div id="" class="mook-markdown-disp-ele hide toolbar-' + _this.toolbar_direction + '"><div></div></div>' + '<div class="mookmarkdown-tools toolbar toolbar-' + _this.toolbar_direction + '"></div>');
      }
      _this.editorEle = _this.element.querySelector('div.mook-markdown-editor-ele'); /**editorエリア */
      _this.dispEle = _this.element.querySelector('div.mook-markdown-disp-ele'); /**dispエリア */
      _this.editor = ace.edit(_this.editorEle); 
      _this.editor.setTheme("ace/theme/" + _this.theme);
      _this.editor.getSession().setMode("ace/mode/markdown");
      _this.editor.setAutoScrollEditorIntoView(true);
      _this.editor.setFontSize(14)
      _this.editor.resize(true);
  
      /**ユーザ定義による変更 */
      _this.toolbar_create();
      _this.settingTheme_clicked(_this.theme)
      if(_this.autoDownloadFontAwesome){_this._require_FontAwesomeDownload();} /**有効に設定してない場合は自分で設定することになる */
      if(_this.autoDownloadMookMDE_CSS){_this._require_mookMDECSSDownload(); }  /**有効に設定してない場合は自分で設定することになる */
  
      /**キー入力と同時に表示エリアに設定を反映する */
      _this.editor.getSession().on("change" , function(e){
        var data = _this.editor.getValue(); // data
        var fileDatas = _this.toolbarEle.querySelectorAll('div > a.btn.image.list-items-group > div.tool-list-items > p.mookMDE_File_DATA_Item');
        for(var i=0;i<fileDatas.length;i++){
          var pattern = new RegExp('(!\\[[^\\]]+\\]\\('+ i +'\\))','g')
          data = data.replace(pattern, '!['+fileDatas[i].getAttribute('file_name')+']('+fileDatas[i].getAttribute('value')+')');
        }
        _this.dispEle.innerHTML = '<div>'+marked(data)+'</div>'; /**getValueはオブジェクトを指定しないとダメ見たい */
        // document.getElementById('editor-value').value = MookMDE.editor.getValue(); /**getValueはオブジェクトを指定しないとダメ見たい */
      });
    };
  
    /**cssタグの挿入系 */
    _this._require_FontAwesomeDownload = function(){ document.querySelector('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">');};
    _this._require_mookMDECSSDownload  = function(){ document.querySelector('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="' + _this.MookMDE_CSS_Path +'">');};
  

    _this.browser_name = function(){
      var result = '不明';
      var agent = window.navigator.userAgent.toLowerCase();
      var version = window.navigator.appVersion.toLowerCase();
    
      if(agent.indexOf("msie") > -1){
        if (version.indexOf("msie 6.") > -1){
          result = 'IE6';
        }else if (version.indexOf("msie 7.") > -1){
          result = 'IE7';
        }else if (version.indexOf("msie 8.") > -1){
          result = 'IE8';
        }else if (version.indexOf("msie 9.") > -1){
          result = 'IE9';
        }else if (version.indexOf("msie 10.") > -1){
          result = 'IE10';
        }else{
          result = 'IE(バージョン不明)';
        }
      }else if(agent.indexOf("trident/7") > -1){
        result = 'IE11';
      }else if(agent.indexOf("edge") > -1){
        result = 'Edge';
      }else if (agent.indexOf("chrome") > -1){
        result = 'Chrome';
      }else if (agent.indexOf("safari") > -1){
        result = 'Safari';
      }else if (agent.indexOf("opera") > -1){
        result = 'Opera';
      }else if (agent.indexOf("firefox") > -1){
        result = 'Firefox';
      }
      return result;
    }

    _this.default_tools =   [
      'bold', 'italic', 'strikethrough', 'header', 'line',
      'code', 'quote', 'list-ul', 'list-ol', 'line',
      'link', 'image', 'table', 'horizontal-rule', 'line',
      'preview', 'side-by-side', 'fullscreen', 'normalscreen', 'set-theme', 'line',
      'undo', 'redo', 'line',
      'guide'
    ]
    _this.tool_items_class = {
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
      'fullscreen'     : 'fas fa-expand-arrows-alt no-disable no-mobile',
      'normalscreen'   : 'fas fa-compress-arrows-alt no-disable no-mobile',
      'guide'          : 'fa fa-question-circle',
      'set-theme'      : 'fa fa-sun',
      'undo'           : 'fa fa-undo',
      'redo'           : 'fa fa-redo'
    }
    _this.tool_items_title = {
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
      'normalscreen'     : 'Toggle Normalscreen',
      'guide'          : 'Markdown Guide',
      'set-theme'      : 'Theme',
      'undo'           : 'Undo',
      'redo'           : 'Redo',
    }
    _this.themes = [
      'chrome',   'clouds',   'crimson_editor',   'dawn',  'dreamweaver',  'katzenmilch',  'eclipse',  'github',  'iplastic',  'kuroir',  'sqlserver',  'textmate',  'tomorrow',  'xcode',
      'ambiance',  'chaos',  'clouds_midnight',  'dracula',  'gruvbox',  'idle_fingers',  'kr_theme',  'merbivore',  'merbivore_soft',  'mono_industrial',  'monokai',  'pastel_on_dark',  'terminal',  'tomorrow_night',  'tomorrow_night_eighties',  'twilight',  'vibrant_ink',  'gob',
      'cobalt',  'solarized_dark',  'tomorrow_night_blue'
    ]
    _this.themes_bgColor = {
      'chrome' : 'FFFFFF',   'clouds' : 'FFFFFF',   'crimson_editor' : 'FFFFFF',   'dawn' : 'F9F9F9',  'dreamweaver' : 'FFFFFF',  'katzenmilch' : 'F3F2F3',  'eclipse' : 'FFFFFF',  'github' : 'FFFFFF',  'iplastic' : 'EEEEEE',  'kuroir' : 'E8E9E8',  'sqlserver' : 'FFFFFF',  'textmate' : 'FFFFFF',  'tomorrow' : 'FFFFFF',  'xcode' : 'FFFFFF',
      'ambiance' : '202020',  'chaos' : '161616',  'clouds_midnight' : '191919',  'dracula' : '282A36',  'gruvbox' : '1D2021',  'idle_fingers' : '323232',  'kr_theme' : '0B0A09',  'merbivore' : '161616',  'merbivore_soft' : '1C1C1C',  'mono_industrial' : '222C28',  'monokai' : '272822',  'pastel_on_dark' : '2C2828',  'terminal' : '000000',  'tomorrow_night' : '1D1F21',  'tomorrow_night_eighties' : '2D2D2D',  'twilight' : '141414',  'vibrant_ink' : '0F0F0F',  'gob' : '0B0B0B',  
      'cobalt' : '002240', 'solarized_dark' : '002B36', 'tomorrow_night_blue' : '002451'
    }
    _this.themes_fontColor = {
      'chrome' : '0f0f0f',   'clouds' : '0f0f0f',   'crimson_editor' : '0f0f0f',   'dawn' : '0f0f0f',  'dreamweaver' : '0f0f0f',  'katzenmilch' : '0f0f0f',  'eclipse' : '0f0f0f',  'github' : '0f0f0f',  'iplastic' : '0f0f0f',  'kuroir' : '0f0f0f',  'sqlserver' : '0f0f0f',  'textmate' : '0f0f0f',  'tomorrow' : '0f0f0f',  'xcode' : '0f0f0f',
      'ambiance' : 'FFFFFF',  'chaos' : 'FFFFFF',  'clouds_midnight' : 'FFFFFF',  'dracula' : 'FFFFFF',  'gruvbox' : 'FFFFFF',  'idle_fingers' : 'FFFFFF',  'kr_theme' : 'FFFFFF',  'merbivore' : 'FFFFFF',  'merbivore_soft' : 'FFFFFF',  'mono_industrial' : 'FFFFFF',  'monokai' : 'FFFFFF',  'pastel_on_dark' : 'FFFFFF',  'terminal' : 'FFFFFF',  'tomorrow_night' : 'FFFFFF',  'tomorrow_night_eighties' : 'FFFFFF',  'twilight' : 'FFFFFF',  'vibrant_ink' : 'FFFFFF',  'gob' : 'FFFFFF',  
      'cobalt' : 'FFFFFF', 'solarized_dark' : 'FFFFFF', 'tomorrow_night_blue' : 'FFFFFF'
    };
    _this.themes_mode = {
      'chrome' : 'whitemode',   'clouds' : 'whitemode',   'crimson_editor' : 'whitemode',   'dawn' : 'whitemode',  'dreamweaver' : 'whitemode',  'katzenmilch' : 'whitemode',  'eclipse' : 'whitemode',  'github' : 'whitemode',  'iplastic' : 'whitemode',  'kuroir' : 'whitemode',  'sqlserver' : 'whitemode',  'textmate' : 'whitemode',  'tomorrow' : 'whitemode',  'xcode' : 'whitemode',
      'ambiance' : 'darkmode',  'chaos' : 'darkmode',  'clouds_midnight' : 'darkmode',  'dracula' : 'darkmode',  'gruvbox' : 'darkmode',  'idle_fingers' : 'darkmode',  'kr_theme' : 'darkmode',  'merbivore' : 'darkmode',  'merbivore_soft' : 'darkmode',  'mono_industrial' : 'darkmode',  'monokai' : 'darkmode',  'pastel_on_dark' : 'darkmode',  'terminal' : 'darkmode',  'tomorrow_night' : 'darkmode',  'tomorrow_night_eighties' : 'darkmode',  'twilight' : 'darkmode',  'vibrant_ink' : 'darkmode',  'gob' : 'darkmode',  
      'cobalt' : 'bluemode', 'solarized_dark' : 'bluemode', 'tomorrow_night_blue' : 'bluemode'
    };
    // hover時にボタンの下にリストを表示する
    _this.tool_listTypeItems = [
      'image', 'table'
    ];
    // tool_listTypeItemsのタグに追加するテキスト
    _this.tool_listTypeItems_data = {
      'image': [
        {text:'Image Link', class: 'toggleimagelink', icon: 'fas fa-link'}, 
        // {text: 'Upload Image', class: 'uploadimage', icon: 'fas fa-file-upload'},
        // {text: 'Past Image', class: 'pastImage', icon: 'fas fa-link'}
      ],
      'table': [
        {text:'Table Add', class: 'drawtable_3_3', icon: 'fas fa-th'}, 
        {text: 'Select a matrix and add a table', class: 'drawtable_x_x', icon: 'fas fa-th-large'},
        {text: 'Table Add from Excel', class: 'drawtable_excel', icon: 'fas fa-file-excel'}
      ],
    }

    /** tool-item用関数一覧 */
    _this.tool_items_func = {
      'bold'           : _this.toggleBold, 
      'italic'         : _this.toggleItalic,
      'strikethrough'  : _this.toggleStrikethrough,
      'header'         : _this.toggleHeadingSmaller,
      'code'           : _this.toggleCodeBlock,
      'quote'          : _this.toggleBlockquote,
      'list-ul'        : _this.toggleUnorderedList,
      'list-ol'        : _this.toggleOrderedList,
      'link'           : _this.drawLink,
      'image'          : _this.drawImage,
      'table'          : _this.drawTable,
      'horizontal-rule': _this.drawHorizontalRule,
      'preview'        : _this.togglePreview,
      'side-by-side'   : _this.toggleSideBySide,
      'fullscreen'     : _this.toggleFullScreen,
      'normalscreen'   : _this.toggleNormalScreen,
      // 'guide'          : _this.toggleFullScreen,
      'set-theme'      : _this.settingTheme_main,
      'undo'           : _this.undo,
      'redo'           : _this.redo,
    };
    _this.toggleBold_extended = function(){};
    _this.toggleItalic_extended = function(){};
    _this.toggleStrikethrough_extended = function(){};
    _this.toggleHeadingSmaller_extended = function(){};
    _this.toggleCodeBlock_extended = function(){};
    _this.toggleBlockquote_extended = function(){};
    _this.toggleUnorderedList_extended = function(){};
    _this.toggleOrderedList_extended = function(){};
    _this.drawLink_extended = function(){};
    _this.drawImage_extended = function(){};
    _this.drawTable_extended = function(){};
    _this.drawHorizontalRule_extended = function(){};
    _this.togglePreview_extended = function(){};
    _this.toggleSideBySide_extended = function(){};
    _this.toggleFullScreen_extended = function(){};
    _this.toggleFullScreen_extended = function(){};
    _this.settingTheme_main_extended = function(){};
    _this.settingTheme_clicked_extended = function(){};
    _this.undo_extended = function(){};
    _this.redo_extended = function(){};
    _this.toolbar_create_end_extend = function(){}; /* toolbar生成後に使用する関数の拡張 */
    _this.toolitems = [];
    _this.theme = 'xcode';
    _this.toolbar_position = 'top';
    _this.toolbar_line = '<span class="toolbar-line"></span>';
    _this.autoDownloadFontAwesome = true;
    _this.autoDownloadMookMDE_CSS = false; /**Auto Insert body beforeend to <style></style> ? */
    _this.MookMDE_CSS_Path = 'css/mookMDE.css';   /**MookMDE CSS FILE PATH */
    _this.cssStyleTagOnly = false; /**Not Download CSS File, use style str*/ /**未実装 */
    if(args.element!=undefined){_this.element = document.getElementById(args.element);}
    if(args.toolbar_position=='top' || args.toolbar_position=='bottom'){_this.toolbar_position=args.toolbar_position;_this.toolbar_direction='horizontal';}
    if(args.toolbar_position=='left' || args.toolbar_position=='right'){_this.toolbar_position=args.toolbar_position;_this.toolbar_direction='vertical';}
    if(_this.themes.indexOf(args.theme) != -1){_this.theme = args.theme;} 
    if(args.autoDownloadFontAwesome == true){_this.autoDownloadFontAwesome = true}
    if(args.autoDownloadMookMDE_CSS == true){_this.autoDownloadMookMDE_CSS = true}
    if(args.MookMDE_CSS_Path != undefined && args.MookMDE_CSS_Path != ''){_this.MookMDE_CSS_Path = args.MookMDE_CSS_Path}
  
  
      /**デフォルトのツールアイテムの場合 */
      for(var i=0;i<_this.default_tools.length;i++){
        _this.toolitems[i] = {
          'name': _this.default_tools[i], 
          'className':_this.tool_items_class[_this.default_tools[i]], 
          'title': _this.tool_items_title[_this.default_tools[i]]
        };
      }
  
      /**toolを追加する */
      if(args.toolbar!=undefined &&  Array.isArray(args.toolbar) && args.toolbar.length > 0){
        /**  
        *  取り敢えず配列であることと0より多いことを確認して処理へ進む
        *  配列の中で許可されるデータは`_this.default_tools`ないにある文字列と同一か
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
          if(typeof(tool) == 'string' || _this.default_tools.indexOf(tool) != -1){
            tmp_toolitems.push({
              'name'     : tool, 
              'className': _this.tool_items_class[tool], 
              'title'    : _this.tool_items_title[tool]
            });
          } else if(typeof(tool.name) == 'string' && tool.name != '' && typeof(tool.action) == 'function' && tool.action != '') {
            var tmp_toolClass = 'fas fa-cat' // classのデフォルト値 
            var tmp_toolTitle = tool.name // actionのデフォルト値
            if(typeof(tool.class)=='string' && tool.class != ''){tmp_toolClass = tool.class} // btnのクラス指定
            if(typeof(tool.title)=='title' && tool.title != ''){tmp_toolTitle = tool.title}  // btnのタイトルプロパティを設定
            if(typeof(tool.is_activate)=='boolean' && tool.is_activate){_this.tool_items_clicked_active.push(tool.name)} // activeクラスを追加するアイテム
            _this.tool_items_func[tool.name] = tool.action; // 関数を登録する
            tmp_toolitems.push({
              'name'     : tool.name, 
              'className': tmp_toolClass, 
              'title'    : tmp_toolTitle
            });
          }
        }
        _this.toolitems = tmp_toolitems;
      }
  
      /**無効にするアイテムについての設定 */
      if(args.deactivate_item!=undefined &&  Array.isArray(args.deactivate_item) && args.deactivate_item.length > 0){
        for(var i=0;i<args.deactivate_item.length;i++){
          for(var j=0;j<_this.toolitems.length;j++){
            var deactivate_item = args.deactivate_item[i]; // 無効化するアイテム
            if(typeof(_this.toolitems[j].name) == 'string' && _this.toolitems[j].name == deactivate_item){_this.toolitems.splice(j, 1);}
          }
        }
      }
  
      /**独自のアイテムを追加する(基本的toolbarの設定と同じ) */
      if(args.addToolbar_item!=undefined &&  Array.isArray(args.addToolbar_item) && args.addToolbar_item.length > 0){
        for(var i=0; i<args.addToolbar_item.length; i++){
          var tool = args.addToolbar_item[i];
          if(typeof(tool.name) == 'string' && tool.name != '' && typeof(tool.action) == 'function' && tool.action != '') {
            var tmp_toolClass = 'fas fa-cat' /**classのデフォルト値  */
            var tmp_toolTitle = tool.name /**actionのデフォルト値 */
            if(typeof(tool.class)=='string' && tool.class != ''){tmp_toolClass = tool.class} /**btnのクラス指定 */
            if(typeof(tool.title)=='title' && tool.title != ''){tmp_toolTitle = tool.title}  /**btnのタイトルプロパティを設定 */
            if(typeof(tool.is_activate)=='boolean' && tool.is_activate){_this.tool_items_clicked_active.push(tool.name)} /**activeクラスを追加するアイテム */
            _this.tool_items_func[tool.name] = tool.action; /**関数を登録する */
            _this.toolitems.push({
              'name'     : tool.name, 
              'className': tmp_toolClass, 
              'title'    : tmp_toolTitle
            });
          }
        }
      }
  
      if(_this.element!=undefined){
        _this.element.classList.add('mook-markdown-ele') /**展開する要素にクラスを追加する */
        _this.htmlInitialize(); /**唯一指定が強制なのは要素を展開するElementのIDのみ{'element': 'target'} */
      } 
    };

  /**Exports */
  if ("process" in global) {
      module["exports"] = MookMDE;
  }
  global["MookMDE"] = MookMDE;
})((this || 0).self || global);

// hljs.initHighlightingOnLoad();

var test = function(){
  console.log('from test func')
}
var ddt;
window.addEventListener('DOMContentLoaded', function() {
  var myMark = new MookMDE({
    element : 'mark',
    toolbar_position: 'top',
    theme: 'chrome',
    autoDownloadMookMDE_CSS: true,
    MookMDE_CSS_Path: 'mookMDE.css',
    'deactivate_item': ['bold'] 
  });
  ddt = myMark;
  var myMark2 = new MookMDE({
    element : 'mark2',
    toolbar_position: 'top',
    theme: 'ambiance',
    autoDownloadMookMDE_CSS: true,
    MookMDE_CSS_Path: 'mookMDE.css',
    'addToolbar_item': [{'name':'test', 'action': test, 'className': 'fa fa-bold', 'title': 'Test'}]
  });
  var myMark3 = new MookMDE({
    element : 'mark3',
    toolbar_position: 'top',
    theme: 'cobalt',
    autoDownloadMookMDE_CSS: true,
    MookMDE_CSS_Path: 'mookMDE.css',
    'addToolbar_item': [{'name':'test', 'action': test, 'className': 'fa fa-bold', 'title': 'Test'}]
  });
});



/**escape関数 */
(function (w) {
  var reRegExp = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExp = new RegExp(reRegExp.source);

  function escapeRegExp(string) {
      return (string && reHasRegExp.test(string))
          ? string.replace(reRegExp, '\\$&')
          : string;
  }

  w.escapeRegExp = escapeRegExp;
})(window);

/**
* ===============================================================================================================================
 * ユーザがアプリ初期化に使用するAPI
 * 'element': 'editor'                   // エディタを展開するエレメントのIDを指定する。(型:str)
 * 'toolbar_position': 'top'             // ツールバーの位置を指定する。種類:[`top`, `right`, `bottom`, `left`]。デフォルト:`top`。(型:str)
 * 'toolbar': ['bold', 'undo', 'redo']   // 表示するアイテムを配列で指定する
 * 'addToolbar_item': [{'name':'test', 'action': func, 'className': 'fa fa-bold', 'title': 'Test'}] // 標準のアイテム以外を追加する
 * 'deactivate_item': ['bold']           // 非表示にしたいアイテムを配列で渡す
 * 'theme': 'solarized_dark'             // エディターのテーマを指定する。種類:別表1。デフォルト:`xcode`。(型:str)
 * 'autoDownloadFontAwesome': true       // FontAwesomeをダウンロードするかどうかの判定。デフォルト:`true`。(型:bool)
 * 'autoDownloadMookMDE_CSS': false      // CSSをダウンロードするかどうかの判定(cdn化してないので自動でstyleタグを挿入してファイル読み込みするかどうかっていう意味)。デフォルト:`false`。(型:bool)
 * 'MookMDE_CSS_Path': 'css/mookMDE.css' // CSSファイルの格納場所を指定する。未指定の場合は`css/mookMDE.css`を読み込む。(型:str)
 * 'cssStyleTagOnly': false              // CSSをファイルではなくスタイルタグに直書きする場合は`true`そうでない場合は`false`(あんまり需要はないかも知れないけどなるべくファイルの管理を減らしたい場合は有効)。デフォルト`false`。(型:bool)
 * 
 * 
 * 
 * 
 * 
 * 
 * ===============================================================================================================================
 * 
 * toolbar・addToolbar_itemの指定方法
 * 配列で指定する標準のアイテムの場合は文字列のみで指定が可能です。
 * 新規でアイテムを追加する場合以下の形式で指定する。
 * {
 *   'name': 'test',             // itemのなまえ(強制)
 *   'action': func,             // 関数を指定する
 *   'className': 'fa fa-bold',  // font-awesomeのアイコンクラス
 *   'title': 'Test',            // ボタンのtitleプロパティを設定する
 * }
 *
 *
 *
 *
 * 別表1(計:36)--------------------
 * 'chrome'
 * 'clouds'   
 * 'crimson_editor'   
 * 'dawn'  
 * 'dreamweaver'  
 * 'katzenmilch'  
 * 'eclipse'  
 * 'github'  
 * 'iplastic'  
 * 'kuroir'  
 * 'sqlserver'  
 * 'textmate'  
 * 'tomorrow'  
 * 'xcode'
 * 'ambiance'  
 * 'chaos'  
 * 'clouds_midnight', 
 * 'dracula'  
 * 'gruvbox'
 * 'idle_fingers'
 * 'kr_theme'
 * 'merbivore'
 * 'merbivore_soft'
 * 'mono_industrial'
 * 'monokai'
 * 'pastel_on_dark'
 * 'terminal'
 * 'tomorrow_night'
 * 'tomorrow_night_eighties'
 * 'twilight'
 * 'vibrant_ink'  
 * 'gob'
 * 'cobalt'
 * 'solarized_dark'
 * 'tomorrow_night_blue'
 * ----------------------------
 *
 * 
 * 
 * 
 * 
 * 
 * 
 * --標準のクリックイベント関数を拡張する場合は再度初期化して実行してください
 * _extendedを抜けば初期関数そのものを編集できます。
 * MookMDE.toggleBold_extended = function(){}
 * MookMDE.toggleItalic_extended = function(){}
 * MookMDE.toggleStrikethrough_extended = function(){}
 * MookMDE.toggleHeadingSmaller_extended = function(){}
 * MookMDE.toggleCodeBlock_extended = function(){}
 * MookMDE.toggleBlockquote_extended = function(){}
 * MookMDE.toggleUnorderedList_extended = function(){}
 * MookMDE.toggleOrderedList_extended = function(){}
 * MookMDE.drawLink_extended = function(){}
 * MookMDE.drawImage_extended = function(){}
 * MookMDE.drawTable_extended = function(){}
 * MookMDE.drawHorizontalRule_extended = function(){}
 * MookMDE.togglePreview_extended = function(){}
 * MookMDE.toggleSideBySide_extended = function(){}
 * MookMDE.toggleFullScreen_extended = function(){}
 * MookMDE.toggleFullScreen_extended = function(){}
 * MookMDE.settingTheme_main_extended = function(){}     // テーマの選択画面の拡張
 * MookMDE.settingTheme_clicked_extended = function(){}  // 実際にテーマを変更する関数の拡張
 * MookMDE.undo_extended = function(){}
 * MookMDE.redo_extended = function(){}
 * 
 * 
 */
