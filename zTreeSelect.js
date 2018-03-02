!function($) {
	 var ZTreeSelect = function(element, options, e) {
	 	if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        this.$newElement = null;
        this.$button = null;
		this.options = $.extend({}, $.fn.selectpicker.defaults, this.$element.data(), typeof options == 'object' && options);
        this.val = ZTreeSelect.prototype.val;
        this.render = ZTreeSelect.prototype.render;
        this.refresh = ZTreeSelect.prototype.refresh;
        //this.init();
        this.ajax_('create');
    };
	ZTreeSelect.prototype = {
        constructor: ZTreeSelect,
		init : function(op,data){
            var that = this, 
				id = this.$element.attr('class').split(" ")[0] +"_"+ this.$element.attr('id'),
				title = this.$element.attr('title'),
                width = this.$element.attr('data-width');
			this.$newElement = this.createView(that);
            this.$button = this.$newElement.children().get(0);
			this.$button_title = $(this.$newElement.children().get(0));//.find('.btn-title');
            if(that.$element.attr('data-search')){
                this.$ul = this.$newElement.children().get(2); 
            }else{
                this.$ul = this.$newElement.children().get(1); 
            }
            
           
            if (id != undefined) {
                $(this.$button).attr('data-id', id);
                $(this.$ul).attr("id",id);
            }
            if(title != undefined && title !=""){
            	$(this.$button_title).text(title);
            }else{
            	$(this.$button_title).text("请选择");
            }
            if(width != undefined){
                $(this.$button_title).css("width",width);
            }else{
                $(this.$button_title).css("width","250px");
            }
            var setting = {
                view: {
                    //showIcon: false,
                    //showLine: false
                },
                data: {
					simpleData: {
						enable: true
					}
				}/*,
				callback:{
					onCheck: zTreeOnCheck
				}*/
			};
            if(this.options.type != "simple"){      //radio 或 checkbox
                setting.check = {};
                setting.check.enable = true;   
                if(this.options.type == "radio"){
                    if(this.options.radioType == "all"){
                        setting.check.chkStyle = "radio";
                        setting.check.radioType = this.options.radioType;
                    }
                }
            }
            if(this.options.zTreeOnCheck != undefined){
                setting.callback = {};
                setting.callback.onCheck = this.options.zTreeOnCheck;
            }
			/*var zNodes =[
				{ id:1, pId:0, name:"随意勾选 1", open:true},
				{ id:11, pId:1, name:"随意勾选 1-1", open:true},
				{ id:111, pId:11, name:"随意勾选 1-1-1"},
				{ id:112, pId:11, name:"随意勾选 1-1-2"},
				{ id:12, pId:1, name:"随意勾选 1-2", open:true},
				{ id:121, pId:12, name:"随意勾选 1-2-1"},
				{ id:122, pId:12, name:"随意勾选 1-2-2"},
				{ id:2, pId:0, name:"随意勾选 2", checked:true, open:true},
				{ id:21, pId:2, name:"随意勾选 2-1"},
				{ id:22, pId:2, name:"随意勾选 2-2", open:true},
				{ id:221, pId:22, name:"随意勾选 2-2-1", checked:true},
				{ id:222, pId:22, name:"随意勾选 2-2-2"},
				{ id:23, pId:2, name:"随意勾选 2-3"}
			];*/
			$.fn.zTree.init($(this.$ul), setting, data);
			this.$element.append(this.$newElement);
            
            this.$li = $(this.$ul).find("li"); 
            //this.$chk = $(this.$ul).find(".button.chk"); 
            
            if(op=="create"){
				this.clickListener();
			}
			//input
			/*var zTreeSelect = "<div class='zTreeSelect'><div class='input-group'>"+
				"<input type='text' class='form-control' id='select_input'><span class='input-group-btn'>"+
				"<button class='btn btn-default btn-select' type='button'><span class='caret'></span></button>"+
				"</span></div></div><ul id='treeDemo' class='ztree' style='display:none; position: absolute;'></ul>";*/
			//button
			/*var zTreeSelect = "<div class='btn-group btn-select'>"+
  				"<button type='button' class='btn btn-default' style='width: 250px'>操作</button>"+
  				"<button type='button' class='btn btn-default'><span class='caret'></span></button>"+
				"</div><ul id='treeDemo' class='ztree' style='display:none; position: absolute;'></ul>";*/
		},
		createView : function(el){
			/*var zTreeSelect = "<div class='btn-group btn-select'>"+
  				"<button type='button' class='btn btn-default btn-title'></button>"+
  				"<button type='button' class='btn btn-default'><span class='caret'></span></button>"+
				"</div><ul id='' class='ztree' style='display:none; position: relative;'></ul>";*/
            var searchbox = el.$element.attr('data-search') ?
                  "<div class='ztree-searchbox ztree' style='display:none;z-index:100;position:relative;'>" +
                "<input type='text' class='form-control zscon ztreeSeach'></div>"
                      : "";
			return $("<div style='position:absolute' tabindex='-1'><button type='button' class='zscon btn btn-default btn-title'></button>"+
                searchbox+
                "<ul id='' class='zscon ztree' style='display:none; position: relative;'></ul></div>");
		},
        ajax_:function(op){ 
            // this.$element.append("<option>ff</option><option>dd</option>");
            var _this = this;
            var $option;
            if(this.options.dataUrl == undefined){
            	if(this.options.localData != undefined){
            		this.init(op, this.options.localData);	
            	}else{
            		this.init(op);	
            	}
            }else{
                var ok_=function (result){
                    var data_=[];
                    if(_this.options.format){ 
                        data_=_this.options.format(result.data); 
                    }
                    else{
                        data_= result.result.data;
                    } 
                    _this.init(op,data_);
                    _this.options.callback_(data_);
                };
                var err_=function (xhr,message){};
                var url_ = this.options.dataUrl;
                if(typeof this.options.dataUrl == "function"){
                    url_ = url_();
                }
                Op.fn.ajax("GET", url_, "json", this.options.paramas, ok_, err_,false) ;
            }
        },
        refresh: function() {
           /* if(this.options.dataUrl){
                this.ajax_('refresh');
            }*/
        },
        clickListener: function() {
            var that = this;
            $(that.$button).on('click', function(ev) {  
                
               	if($(that.$ul).css("display") == "none"){
					var inpg = $(that.$button);
					var yPos = inpg.offset().top + inpg.height()+1;
					var xPos = inpg.offset().left;
                    $(that).parent().css("position","relative");
					//$(that.$ul).css({"top":yPos ,"left":xPos, "z-index":100});
                    $(that.$ul).css("z-index",100);
					var buttonWidth = inpg.width() + 12*2;//padding:12px
                    if($(that.$ul).width() < buttonWidth){
						$(that.$ul).width(buttonWidth);
                        if($(that.$ul).prev().hasClass("ztree-searchbox")){
                            $(that.$ul).prev().width($(that.$ul).width()-8*2); //padding:8px
                        }
					}
					$(that.$ul).css("display",'block');
                    if($(that.$ul).prev().hasClass("ztree-searchbox")){                        
                        $(that.$ul).prev().find("input").focus();
                        $(that.$ul).prev().find("input").val(""); 
                        $(that.$ul).find("li").removeClass("hidden");                     
                        $(that.$ul).prev().css("display",'block');
                    }
                    /*****修改滚动条样式****/
                    $(that.$ul).niceScroll();
                    /***********************/
				}else{
					$(that.$ul).css("display",'none');
                    if($(that.$ul).prev().hasClass("ztree-searchbox")){
                        $(that.$ul).prev().find("input").val("");
                        $(that.$ul).find("li").removeClass("hidden"); 
                        $(that.$ul).prev().css("display",'none');
                    }
				}
                $(that.$ul).scrollTop(0);//解决firfox下滚动条滚到下面，再次打开还在最下面的问题
	        });
            $(that.$li).on('click', function(e){
                if(that.options.type == "radio"){  //单选
                    if($(this).find("ul").length == 0){//选中没有子节点的
                        var chkText = $(this).children("a").text();
                        $(that.$button_title).text(chkText);
                    }
                }
            })
            
            $(".caret").on('click', function(){
              $(that.$ul).css("display",'none');  
            });
            $(that.$ul).on('click',function(e){
                e.stopPropagation();
            });
            /*根据文本框的关键词输入情况自动匹配树内节点 进行模糊查找*/
            $(".ztree-searchbox").on('keyup',function(){
                if ($(this).children().val().length > 0) {
                    var zTree = $.fn.zTree.getZTreeObj($(this).next().attr("id"));
                    var nodeList = zTree.getNodesByParamFuzzy("name", $(this).children().val());
                    $(this).next().find("li").addClass("hidden");
                    if(nodeList.length != 0){
                        $.each(nodeList,function(index,nItem){
                            $("#"+nItem.tId).removeClass("hidden");
                        })
                    }                    
                } else {
                    $(this).next().find("li").removeClass("hidden");             
                }  
            })
        },
        val : function(value){
            var that = this;
            var treeObj = $.fn.zTree.getZTreeObj($(that.$ul).attr("id"));
        	if(value){	//归根据返回的ID 向下拉列表赋值, value="1,2,3...";
                var arr = value.split(",");
                var nodes = [];
                var node = "";
                for(var i=0; i<arr.length; i++){
                    node = "";
                    node = treeObj.getNodeByParam("id", arr[i], null);
                    treeObj.selectNode(node);
                }
        	}else{		//从下拉列表取值
				var nodes = treeObj.getCheckedNodes(true);
            	var result = [];
				$.each(nodes, function(index, item){
                    if(item.children == undefined){
						result.push(item.id)
					}
				})
				return result;
        	}
        },
        text : function(){
            var that = this;
            var treeObj = $.fn.zTree.getZTreeObj($(that.$ul).attr("id"));
            var nodes = treeObj.getCheckedNodes(true);
            var result = [];
            $.each(nodes, function(index, item){
                if(item.children == undefined){
                    result.push(item.name)
                }
            })
            return result;
        },
        id_text : function(){
            var that = this;
            var treeObj = $.fn.zTree.getZTreeObj($(that.$ul).attr("id"));
            var nodes = treeObj.getCheckedNodes(true);
            var result = [];
            $.each(nodes, function(index, item){
                if(item.children == undefined){
                    result.push(item.id+"%"+item.name);
                }
            })
            return result;
        }
	};
	$.fn.selectpicker.defaults = {
        type : "checkbox",//"checkbox","radio","simple"
        radioType : "all" ,//"all","level"
        callback_:function(data){return data}         
    };
	$.fn.zTreeSelect = function(option, event) {
		var args = arguments;
       	var value;
       	var chain = this.each(function() {
            var $this = $(this),
                data = $this.data('ztreeSelect'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('ztreeSelect', (data = new ZTreeSelect(this, options, event)));
            } else if (options) {
                for(var i in options) {
                   data.options[i] = options[i];
                }
            }

            if (typeof option == 'string') {
                //Copy the value of option, as once we shift the arguments
                //it also shifts the value of option.
                var property = option;
                if (data[property] instanceof Function) {
                    [].shift.apply(args);
                    value = data[property].apply(data, args);
                } else {
                    value = data.options[property];
                }
            }
        });

        if (value !== undefined) {
            return value;
        } else {
            return chain;
        }

		
	}
}(window.jQuery);
