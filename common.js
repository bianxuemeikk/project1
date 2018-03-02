//配置页面显示
function configShow(url_, title_, btnName_, width_,bcall_,bdata_) {
    var _btnTraget = null;
    var evt = null;
    var show_flag = 0;
    if (window.event) { //chrome
        evt = window.event;
        _btnTraget = evt.currentTarget;
    } else { // firefox
        _btnTraget = $(this.document.activeElement);
    }
    var width_other = width_;
    $(_btnTraget).blur(); //失去焦点
    var subModal_ = "subModal" + Math.round(Math.random().toFixed(8) * 100000000);
    //var myModal = '<div class="modal hide fade" id="myModal" data-backdrop="static"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3></h3></div><div class="modal-body"></div><div class="modal-footer"><a href="#" class="btn" data-dismiss="modal">Close</a><a href="#" class="btn btn-primary saveConfig">Save changes</a></div></div>',
    var subModal;
    if ($("body").find('.modal').length == 0) {
        subModal = '<div fid="one" class="modal hide fade modal_" id="' + subModal_ + '"  data-backdrop="static"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3></h3></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn closeConfig" data-dismiss="modal">Close</button><button class="btn btn-primary saveConfig" type="button">Save changes</button></div></div>';
    } else {
        var fid_ = $("body").find('.modal').last().attr("id");
        subModal = '<div fid="' + fid_ + '" class="modal hide fade modal_ submodal" id="' + subModal_ + '"  data-backdrop="static"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3></h3></div><div class="modal-body"></div><div class="modal-footer"><button class="btn closeConfig" data-dismiss="modal">Close</button><button class="btn btn-primary saveConfig" type="button">Save changes</button></div></div>';
    }
    $("body").append(subModal);
    $('.modal_').draggable({
            containment:'.modal-backdrop',
            scroll:false,
            cursor:'move', 
            cancel:'.btn,.modal-body,.modal-footer'
    });

    var $subModal = $("#" + $(subModal).attr('id'));

    var ok_ = function(html_) {
        modalSetting($subModal, html_, title_, btnName_, width_);
        modalShow($subModal, width_, 'show');
        $.i18nDo(); //执行html的多语言替换
        $('[title]').tooltip();
    };
    var err_ = function() {};
    Op.fn.ajax("GET", url_, "html", "", ok_, err_, false);

    var $fid = $(subModal).attr('fid');
    $subModal.on('hidden', function() {
        if($('.modal-backdrop').length!=0 && !($('.modal-backdrop').hasClass('in'))){
             $('.tooltip,.fade ,.right ,.in').css('display','none');
        }
        if ($fid != "one") {
            if($("#" + $fid).attr('fid')=='one' && $('.modal').length>=3){

            }else{
                 modalShow($("#" + $fid), width_, 'show');
            }
           
        }
        if ($("body").find('.modal').last().attr('fid') == $fid) {
            $("body").find('.modal').last().remove();
        }
        $('.modal-body').css({'overflow':'auto'});
    })
    $subModal.on('shown', function() { 
        show_flag++;
        if ($fid != "one") {
            modalShow($("#" + $fid), width_other, 'hide');
        }else{
            modalShow($("div[fid="+$fid+"]"), width_other, 'show');
        }
        if(show_flag == 1){
            if(bcall_){if(bdata_){bcall_(bdata_)}else{bcall_()};}else{};
        }
        $.urlDcd();//对回显的数据做url解码
    })
}

function modalSetting(modal, html_, title_, btnName_, width_) {
    var $footer = modal.find('.modal-footer').find('.saveConfig'),
        $footerCloseBtn = modal.find('.modal-footer').find('.closeConfig'),
        $title = modal.find('.modal-header h3');
    if (modal.find('.modal-body').children().length != 0) {
        modal.find('.modal-body').children().remove();
    }
    
    modal.find('.modal-body').append(html_);
    modal.find('.modal-body').find('form').prepend("<input type='password' style='display:none'/>");

    if (title_) {
        $title.text(title_);
    }
    $footer.css('visibility', 'visible');
    if (btnName_) {
        $footer.text(btnName_);
        if (btnName_ == 'del') {
            $footer.css('display', 'none');
        }
    }
    $footerCloseBtn.text($.i18n.prop("wglang--101855"));//"取消"
}

function modalShow(myModal, width_, state) {
    width_ = width_ || 600;
    var height_ = '10%';
    if((($(window).height() - myModal.outerHeight()) / 2) + $(window).scrollTop()>0){ 
        height_ = (($(window).height() - myModal.outerHeight()) / 2) + $(window).scrollTop()+'px';
    }
    myModal.modal(state).css({
        width: width_ + "px",
        'margin-left': function() {
            return -($(this).width() / 2);
        },
        top:height_,
        position:'absolute'
    }); 
}
/*
   url      Ajax请求的url地址
   datas    form表单下发的json数据
   ok_      Ajax请求返回成功处理函数
   error_   Ajax请求返回失败处理函数
   validate form表单验证处理函数
 */
function modalAjax(url, datas, validate, ok_, error_) {
    if (ok_ == undefined) {
        ok_ = function() {}
    }
    if (error_ == undefined) {
        error_ = function() {}
    }
    if (validate == undefined) {
        validate = function() {
            return true;
        }
    }
    $('.saveConfig').bind('click', function() {
        datas = validate();
        if (datas != null && datas != false) {
            Op.fn.config(url, datas, ok_, error_);
            if ($('.addModal').length == 0) {
                $('.modal_').last().find('.close').click();
            }
        }
    });
}
/*同步post请求*/
function modalAjaxPostSyn(url, datas, validate, ok_, error_) {
    if (ok_ == undefined) {
        ok_ = function() {}
    }
    if (error_ == undefined) {
        error_ = function() {}
    }
    if (validate == undefined) {
        validate = function() {
            return true;
        }
    }
    $(".saveConfig:last").bind('click', function() {
        datas = validate();
        /*从下拉列表添加时‘确定’按钮会多出data-dismiss="modal"属性，点击确定时会自动关闭页面导致校验不好用
        增加else校验不成功时返回false页面不会关闭*/
        if (datas != null && datas != false) {
            //Op.fn.config(url, datas, ok_, error_);
            Op.fn.ajax('POST',url,'text',datas, ok_, error_,false);
            if ($('.addModal').length == 0) {
                $('.modal_').last().find('.close').click();
            }
        }else{
            return false;
        }
    });
}
/*
 * modalAjaxSyn 与 modalAjax区别是 去掉关闭窗口操作，将关闭窗口移动到外部
 * 可以达到同步效果。 参考样例:snmp添加
 */
function modalAjaxSyn(url, datas, validate, ok_, error_) {
    if (ok_ == undefined) {
        ok_ = function() {}
    }
    if (error_ == undefined) {
        error_ = function() {}
    }
    if (validate == undefined) {
        validate = function() {
            return true;
        }
    }
    $('.saveConfig').bind('click', function() {
        datas = validate();
        if (datas != null && datas != false) {
            Op.fn.config(url, datas, ok_, error_);
        }
    });
}


//获取表单数据
function getValues(fields) {
    var str = "",
        json1;
    $.each(fields, function(index, item) {
        str += '"' + item.name + '"' + ':' + '"' + item.value + '"' + ',';
    })
    str = str.substring(0, str.length - 1);
    str = "{" + str + "}";
    return $.parseJSON(str);
}

//获取表单数据 转成json-string
function getJsonString(fields) {
    var str = "",
        json1;
    $.each(fields, function(index, item) {
        str += '"' + item.name + '"' + ':' + '"' + item.value + '"' + ',';
    })
    str = str.substring(0, str.length - 1);
    str = "{" + str + "}";
    return str;
}
//动态加载文件
function loadJsCssFile(filename, filetype) {
    if (filetype == 'js') {
        var fileRef = document.createElement('script');
        fileRef.setAttribute('type', 'text/javascript');
        fileRef.setAttribute('src', filename);
    } else if (filetype == 'css') {
        var fileRef = document.createElement('link');
        fileRef.setAttribute('rel', 'stylesheet');
        fileRef.setAttribute('type', 'text/css');
        fileRef.setAttribute('href', filename);
    }
    if (typeof fileRef != 'undefined') {
        // $('.myModal').find('.modal-body').append(fileRef); 
    }
}
//UMS.html
function setContentHeight_() { 
    var height_ = $(document.body).height();   
    var contentHeight = $("#mainFrameAccount").height(); 

    if (height_ == 0) {
        height_ = window.screen.height-50;
    } 
    if (contentHeight > height_) {  
        if (contentHeight < 700) { 
            $('.sidebar-nav_').height(height_-50);
            $('#sidebar').height(height_);
        } else{
            $('.sidebar-nav_').height(contentHeight+70);
            $('#sidebar').height(contentHeight+70);
        }
    } else { 
        $('.sidebar-nav_').height(height_-50);
        $('#sidebar').height(height_);
    }
    $(document.body).height(window.screen.height-110);
    //},5000)
}
function setContentHeight() {
    // setTimeout(function(){
         if($('.navbar-inner1').length==0){
            setContentHeight_();
            return;
         }
    var varH = 255;
    if(screen.width>=1920){
       varH = 195;
    }
    var height_ = $(document.body).height() - varH , //height_ = window.screen.height-255,
        contentHeight = 600;
    if ($('.tenantPage').css('display') == 'none') {
        contentHeight = $("#mainFrame").height();
    } else {
        contentHeight = $("#mainFrameAccount").height();
    }
    if (height_ == 0) {
        height_ = window.screen.height - 260;
    } 
    var help_height = $('.help_content').find('.nav-tabs').height(); 
    if (contentHeight > height_) { 
        if (contentHeight < 600) {
            $('.sidebar-nav_').height(window.screen.height - 260);
        } else {
            $('.sidebar-nav_').height(contentHeight + 70);
        }
        if(contentHeight<help_height && help_height>600){
            $('.sidebar-nav_').height(help_height+70);
        }
    } else {
        if (height_ < 600) {
            height_ = window.screen.height - 260;
        }
        if(help_height>height_ && help_height>600){
            height_ = help_height+70;
        }
        $('.sidebar-nav_').height(height_);
    }
    if ($('.tenantPage').css('display') == 'block') {
        $("#tenant_").height($(".sidebar-nav_").height()-26.32);
    }
    $(document.body).height(window.screen.height - 255);

    //},5000)
}

var interval; //倒计时总秒数量
function initTask(obj, getChartData) {
    var intDiff = parseInt(obj.val());
    interval = setInterval(function() {
        var second = 0; //时间默认值       
        if (intDiff > 0) {
            second = Math.floor(intDiff);
        }
        obj.parent().find('.filter-option').html(obj.val() == 'none' ? $.i18n.prop("wglang--102387")/*'无'*/ : obj.val() + '(' + second + $.i18n.prop("wglang--102859")/*'秒'*/+')');

        intDiff--;
        if (intDiff < 0) {
            getChartData();
            intDiff = obj.val();
        }
    }, 1000);
}

function stopInit() {
    clearInterval(interval); //关闭定时器  
}
var interval_; //倒计时总秒数量
function initTask_(obj, refreshTable) {
    var intDiff = parseInt(obj.val());
    interval_ = setInterval(function() {
        var second = 0; //时间默认值       
        if (intDiff > 0) {
            second = Math.floor(intDiff);
        }
        obj.parent().find('.filter-option').html(obj.val() == 'none' ? $.i18n.prop("wglang--102387")/*'无'*/ : obj.val() + '(' + second + $.i18n.prop("wglang--102859")/*'秒'*/+')');
        intDiff--;
        if (intDiff < 0) {
            refreshTable();
            intDiff = obj.val();
        }
    }, 1000);
}

function stopInit_() {
    clearInterval(interval_); //关闭定时器  
}
var interval_sec;
function initTaskSec(fn,sec){
    interval_sec = setInterval(fn,sec);
}
function stopTaskSec(){
    clearInterval(interval_sec);
}

 //定时加载页面任务
        
var interval_home1,interval_home2,interval_home3,interval_home4,interval_home5; //倒计时总秒数量
function initTask_home(firstCol_array, secondCol_array,thirdCol_array,refreshObj) {
    //将三个数组合并成一个数组,进行遍历
   // firstCol_array = $.merge(firstCol_array, secondCol_array);
    //firstCol_array = $.merge(firstCol_array, thirdCol_array);
    var arr = ['ipstop5','apptop5'],
        arr1= ['usertop5','ipssdtop5','inflow'],
        arr2 = ['memory'],
        arr3 = ['ipseventlist'];
    interval_home1 = setInterval(function() {
        for (var i = 0; i < firstCol_array.length; i++) {
            if($.inArray(firstCol_array[i], arr) == -1 && $.inArray(firstCol_array[i], arr1) == -1 && $.inArray(firstCol_array[i], arr2) == -1 && $.inArray(firstCol_array[i], arr3) == -1){
                refreshObj(firstCol_array[i]); 
            } 
        };       
    },20000);
    interval_home2 = setInterval(function() { 
        for (var j = 0; j < firstCol_array.length; j++) { 
            if($.inArray(firstCol_array[j], arr) != -1 && $.inArray(firstCol_array[j], arr1) == -1 && $.inArray(firstCol_array[j], arr2) == -1 && $.inArray(firstCol_array[j], arr3) == -1){
                refreshObj(firstCol_array[j]); 
            } 
        };
            
    },50000); 
    interval_home3 = setInterval(function() { 
        for (var k = 0; k < firstCol_array.length; k++) {   
            if($.inArray(firstCol_array[k], arr) == -1 && $.inArray(firstCol_array[k], arr1) != -1 && $.inArray(firstCol_array[k], arr2) == -1 && $.inArray(firstCol_array[k], arr3) == -1){
                refreshObj(firstCol_array[k]);
            } 
        };
            
    },60000);
    interval_home4 = setInterval(function() { 
        for (var h = 0; h < firstCol_array.length; h++) {   
            if($.inArray(firstCol_array[h], arr) == -1 && $.inArray(firstCol_array[h], arr1) == -1 && $.inArray(firstCol_array[h], arr2) != -1 && $.inArray(firstCol_array[h], arr3) == -1){
                refreshObj(firstCol_array[h]);
            } 
        };
    },120000);
    interval_home5 = setInterval(function() { 
        for (var n = 0; n < firstCol_array.length; n++) {   
            if($.inArray(firstCol_array[n], arr) == -1 && $.inArray(firstCol_array[n], arr1) == -1 && $.inArray(firstCol_array[n], arr2) == -1 && $.inArray(firstCol_array[n], arr3) != -1){
                refreshObj(firstCol_array[n]);
            } 
        };
    },15000);
}

function stopInit_home() {
    clearInterval(interval_home1); //关闭定时器  
    clearInterval(interval_home2); //关闭定时器   
    clearInterval(interval_home3); //关闭定时器  
    clearInterval(interval_home4); //关闭定时器 
    clearInterval(interval_home5); //关闭定时器  
}

//应用可视首页定时器
var interval_home_app1, interval_home_app2;
function initTask_home_itm(interType,ajaxSystemInfor,getInterMain,getSystemRes){
    interval_home_app1 = setInterval(function() {
        ajaxSystemInfor();   
        getInterMain(interType);
    },20000);
    interval_home_app2 = setInterval(function() { 
       getSystemRes();
    },120000)
}
function stopInit_home_app(){
    clearInterval(interval_home_app1); //关闭定时器  
    clearInterval(interval_home_app2); //关闭定时器   
}

//截取字符串name（含中英文）的前limit个字符（一个汉字占两个字符）
function breakStr(name, limit){
    var reCN = /[\u4E00-\u9FA5]/i;
    var len = 0;
    var nameShow = "";
    for(var i=0; i<name.length; i++){
        if(reCN.test(name[i])){
            len+=2;
        }else{
            len++;
        }
        if(len <= limit){
            nameShow += name[i];
        }else{
        }
    }
    return nameShow;
}
function maskLoading() {
    $(".showbox").stop(true).animate({
        'margin-top': '300px',
        'opacity': '1'
    }, 'fast');
    var h = $(document).height();
    $(".overlay").css({
        "height": h
    });
    $(".overlay").css({
        'display': 'block',
        'opacity': '0.8'
    });
}

function hideMaskLoading() {
    setTimeout(function() {

        $(".showbox").stop(true).animate({
            'margin-top': '250px',
            'opacity': '0'
        }, 50);

        $(".overlay").css({
            'display': 'none',
            'opacity': '0'
        });

    }, 300);
}

function maskLoadingUpgrade() {
    $(".showbox").stop(true).animate({
        'margin-top': '300px',
        'opacity': '1'
    }, 'fast');
    var h = $(document).height();
    $(".overlay").css({
        "height": h,
        "background": '#666666'
    });
    $('.loadingWord').html('<img src="/images/loading.gif">'+$.i18n.prop("wglang--103713")/*请耐心等待。。。'*/);
    $(".overlay").css({
        'display': 'block',
        'opacity': '0.8',
        'z-index': '2230'
    });
}

function hideMaskLoadingUpgrade() {
    setTimeout(function() {

        $(".showbox").stop(true).animate({
            'margin-top': '250px',
            'opacity': '0'
        }, 50);
        $('.loadingWord').html('<img src="/images/loading.gif">'+$.i18n.prop("wglang--103714")/*Loading。。。。*/);
        $(".overlay").css({
            'display': 'none',
            'opacity': '0',
            'z-index': '998',
            "background": '#f6f4f5'
        });

    }, 300);
}
//loaddingWord loading的提示名字(比如正在探测 或 数据加载中 只写文字即可代码中加。。。了)
//obj 把当前的遮罩放在哪个页面上，取对应的对象$('#second'),
//fullScreen 是否全遮罩还是模块部分遮罩 true/false
//background_是否需要背后的遮罩 需要就写出对应的色值 不需要就为none 比如IP/Mac探测
function maskLoading_(loaddingWord,obj,fullScreen,background_) {
    $(".showbox_msk").stop(true).animate({
        'margin-top':  obj.height()/3,
        'opacity': '0.8'
    }, 'fast');
    var h = $(document).height();
    if(obj){
        h = obj.height();
    }  
    obj.css({
        "position":'relative',
        "width":'100%'
    })  
    if(fullScreen){//全屏
        $(".mask_overlay").css({
            'position':'fixed',
            'top':0,
            'bottom':0,
            'left':0,
            'right':0,
            'width':'100%',
            "background":background_
        });
        $('.loadingWord_msk').css({
            'top':'45%',
            'left':'45%',
            'width':'auto',
            'position':'fixed'
        })
    }else{//table  探测
        $(".mask_overlay").insertBefore(obj);
        $(".mask_overlay").css({
            "height": h, 
            'width':'97.6%', 
            'overflow-x':'hidden',
            'position':'absolute',
            "background": background_
        });
    }
    $('.loadingWord_msk').html('<img src="/images/loading.gif">'+loaddingWord+$.i18n.prop("wglang--103715")/*'。。。'*/);
    $(".mask_overlay").css({
        'display': 'block',
        'opacity': '0.8',
        'z-index': '2231'
    }); 
}
function hideMaskLoading_() {
    if($(".mask_overlay").css('display')=='block'){
        setTimeout(function() { 
            $(".showbox_msk").stop(true).animate({
                'margin-top': '250px',
                'opacity': '0'
            }, 50);
            $('.loadingWord_msk').html('<img src="/images/loading.gif">'+$.i18n.prop("wglang--103714")/*Loading。。。。*/);
            $(".mask_overlay").css({
                'display': 'none',
                'opacity': '0',
                'z-index': '998',
                "background": '#f6f4f5'
            });
        }, 300);
    } 
}
/*处理物理接口函数 此函数针对uri:/if/ethernet/get*/
function formatEthernetIf(data) {
    var datalist = [];
    var dataObject = {};
    $.each(data.Ge, function(nIndex, nItem) {
        dataObject.text = nItem.name;
        dataObject.value = nItem.name;
        datalist.push(dataObject);
        dataObject = {};
    });
    if (data["Ten-Ge"] != null) {
        $.each(data["Ten-Ge"], function(nIndex, nItem) {
            dataObject.text = nItem.name;
            dataObject.value = nItem.name;
            datalist.push(dataObject);
            dataObject = {};
        });
    }
    return datalist;
}


/* 下面函数都是针对uri:/if/get 开始*/
/*
 * 接口公共处理函数
 * data -- 待处理的数据 datalist -- 保存处理数据  type -- 接口类型
 * type -- Ge/Bridge/Link-Aggregation/Ten-Ge/Vty  PS:Ten-Ge和Vty 暂时未处理
 */
function IfComment(data, datalist, type) {
    var dataObject = {};
    $.each(data.interface, function(nIndex, nItem) {
        if (nItem.iftype == type) {
            dataObject.text = nItem.ifname;
            dataObject.value = nItem.ifname;
            datalist.push(dataObject);
            dataObject = {};
        }
    });
    return datalist;
}

function IfVlanComment(data, datalist, type) {
    var dataObject = {};
    $.each(data.interface, function(nIndex, nItem) {
        if (nItem.iftype == type) {
            if(nItem.ifname.indexOf('.') == -1){
                dataObject.text = nItem.ifname;
                dataObject.value = nItem.ifname;
                datalist.push(dataObject);
                dataObject = {};
            }
        }
    });
    return datalist;
}

/* 
 * 此函数是获取物理口 和 Vlan
 * 简要说明 物理口和vlan的类型都是Ge
 * 但是表示形式不同
 * 物理口:{"ifname":"Ge0/0/2","iftype":"Ge"}
 * Vlan: {"ifname":"Ge0/0/2.2","iftype":"Ge"}
 * Vlan中接口名称中有一个点"."
 * E:ethernet
 * V:Vlan
 */
function GetEVIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    var newArray = IfComment(data, datalist, "Ge");
    return IfComment(data, newArray, "Ten-Ge");
}

/*
 * 获得万兆口
 */
function GetTenEthIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    return IfComment(data, datalist, "Ten-Ge");
}

/* 
 * 此函数是获取物理口
 * 过滤掉vlan
 */
function GetEthIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    var newArray = [];
    datalist = GetEVIfInfo(data, datalist);
    $.each(datalist, function(nIndex, nItem) {
        if (nItem.text.indexOf(".") == -1) {
            newArray.push(nItem);
        }
    });

    return newArray;
}

/* 
 * 此函数是获取Vlan
 * 过滤掉物理口
 */
function GetVlanIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    var newArray = [];
    datalist = GetEVIfInfo(data, datalist);
    $.each(datalist, function(nIndex, nItem) {
        if (nItem.text.indexOf(".") > 0) {
            newArray.push(nItem);
        }
    });
    return newArray;
}

/* 链路聚合口 */
function GetLinkIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    return IfComment(data, datalist, "Link-Aggregation");
}

/* Vlan链路聚合口 */
function GeVlantLinkIfInfo(data, datalist) {
    if (datalist == null) {
        datalist = [];
    }
    return IfVlanComment(data, datalist, "Link-Aggregation");
}

/*
 * 外部使用接口:获取物理接口(只有)
 * uri: /if/get
 */
function formatEthIf(data) {
    var datalist = [];
    return GetEthIfInfo(data, datalist);
}

/*
 * 外部使用接口:获取物理口(只有) 、链路聚合口
 * 针对vlan子接口绑定
 * E:ethernet
 * L:Link-Aggregation
 */
function formatELIf(data) {
    var datalist = [];
    datalist = GetEthIfInfo(data, datalist);
    return GeVlantLinkIfInfo(data, datalist);
}

/*
 * 外部使用接口:获取物理口、链路聚合口、Vlan
 * 使用地方:针对桥接口绑定
 * E:ethernet
 * L:Link-Aggregation
 * V:Vlan
 */
function formatELVIf(data) {
    var datalist = [];
    datalist = GetEVIfInfo(data, datalist);
    return GetLinkIfInfo(data, datalist);
}

/*
 * 获得所有接口  arp配置时候需要使用
 * Ge Ten-Ge vlan Bridge Link-Aggregation
 */
function formatAllIf(data) {
    var dataObject = {},
        datalist = [];
    $.each(data.interface, function(nIndex, nItem) {
        if (nItem.iftype != "Console" && nItem.iftype != "Vty" && nItem.iftype != "Virtual-Template" && nItem.iftype != "Tunnel" && nItem.iftype != "Dialer") {
            dataObject.text = nItem.ifname;
            dataObject.value = nItem.ifname;
            datalist.push(dataObject);
            dataObject = {};
        }
    });
    return datalist;
}

/*
 * 获得所有接口  6种
 * Ge Ten-Ge vlan Bridge Link-Aggregation Gre-Tunnel
 */
function formatAllIf6(data) {
    var dataObject = {},
        datalist = [];
    $.each(data.interface, function(nIndex, nItem) {
        if (nItem.iftype != "Console" && nItem.iftype != "Vty" && nItem.iftype != "Virtual-Template" && nItem.iftype != "Dialer") {
            dataObject.text = nItem.ifname;
            dataObject.value = nItem.ifname;
            datalist.push(dataObject);
            dataObject = {};
        }
    });
    return datalist;
}

/*
 * 网管服务器配置获得所有接口  20G除了管理口
 * Ge Ten-Ge vlan Bridge Link-Aggregation
 */
function formatAllIf5(data) {
    var dataObject = {},
        datalist = [];
    $.each(data.interface, function(nIndex, nItem) {
        if (nItem.iftype != "Console" && nItem.iftype != "Vty" 
            && nItem.iftype != "Virtual-Template" && nItem.iftype != "Tunnel" 
            && nItem.iftype != "Dialer" && nItem.iftype != "Man") {
            dataObject.text = nItem.ifname;
            dataObject.value = nItem.ifname;
            datalist.push(dataObject);
            dataObject = {};
        }
    });
    return datalist;
}


/* 下面函数都是针对uri:/if/get 结束 */


/*acl 名称*/
// function formatAclName(data){
//       var datalist = [];
//       var dataObject = {};
//       $.each(data.acls,function(nIndex,nItem){
//         dataObject.text = nItem["acl_name"];
//         dataObject.value = nItem["acl_name"];
//         datalist.push(dataObject);
//         dataObject = {};
//       });
//       return datalist;
// }
//acl 下拉菜单 uri:/acl/name/get
function aclSel(data) {
    var datalist = [];
    var dataObject = {};
    if (data['acls']) {
        $.each(data['acls'], function(nIndex, nItem) {
            dataObject.text = nItem.name;
            dataObject.value = nItem.name;
            datalist.push(dataObject);
            dataObject = {};
        });
    }
    return datalist;
}
//地址对象sel下拉菜单 uri；/objectaddr/get
function objFun(data) {
    //console.log(data);
    var datalist = [];
    var dataObject = {};
    $.each(data.objaddr, function(nIndex, nItem) {
        dataObject.text = nItem.objaddress;
        dataObject.value = nItem.objaddress;
        datalist.push(dataObject);
        dataObject = {};
    });
    return datalist;
}
//掩码sel下拉菜单 uri:/json/mask.json
function maskFun(data) {
    //console.log(data);
    var datalist = [];
    var dataObject = {};
    $.each(data.mask, function(nIndex, nItem) {
        dataObject.text = nItem.name;
        dataObject.value = nItem.name;
        datalist.push(dataObject);
        dataObject = {};
    });
    return datalist;
}
//流控规则下拉菜单 uri:/dp/itm/action/menu/get
function flowCtrRuleSel(data) {
    var datalist = [];
    var dataObject = {};
    if (data['actionmenu']) {
        $.each(data['actionmenu'], function(nIndex, nItem) {
            // $.each(nItem,function(i,n){
            dataObject.text = nItem;
            dataObject.value = nItem;
            datalist.push(dataObject);
            // })       
            dataObject = {};
        });
    }
    return datalist;
}
//时间对象下拉菜单 uri:/objecttime/get
function timeObjSel(data) {
    var datalist = [{
        "text": "",
        "value": ""
    }];
    var dataObject = {};
    if (data['objtime']) {
        $.each(data['objtime'], function(nIndex, nItem) {
            dataObject.text = nItem['objtimename'];
            dataObject.value = nItem['objtimename'];
            datalist.push(dataObject);
            dataObject = {};
        });
    }
    if (data['objtimegrp']) {
        $.each(data['objtimegrp'], function(nIndex, nItem) {
            dataObject.text = nItem['objtimegrpname'];
            dataObject.value = nItem['objtimegrpname'];
            datalist.push(dataObject);
            dataObject = {};
        });
    }
    return datalist;
}
//流控域下拉菜单 uri:/dp/itm/pipe/menu/get
function flowPipeSel(data) {
    var datalist = [];
    var dataObject = {};
    if (data['pipe-menu']) {
        $.each(data['pipe-menu'], function(nIndex, nItem) {
            dataObject.text = nItem;
            dataObject.value = nItem;
            datalist.push(dataObject);
            dataObject = {};
        });
    }

    return datalist;
}

//切换按钮操作函数（现在只有两个按钮，多个按钮切换时需补充该函数）
//使用方法：在html文件中切换的面板同意增加switchPanel类，btn和panel的对应关系为：.btnLeft(切换按钮)对应 .btnLeftPanel(切换的内容)(.btnLeft必须放在html文件中的第一个类)
function switchPage(){
    $(".changeBtn li").on('click', function(ev){
        $(".changeBtn li").removeClass("active");
        var curTar = ev.target.className.trim().split(" ")[0];
        $('.switchPanel').hide();
        $('.'+curTar+'Panel').show();
        $(ev.target).addClass("active");
    });
    
}


/*****************判断中文及英文字符串长度*******************************/
var strobj = {};
strobj.GetLength = function(str) {
    var realLength = 0,
        len = str.length,
        charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        } else {
            realLength += 2;
        }
    }
    return realLength;
};

function getLen(str) {
    if (strobj.GetLength(str) > 200) {
        alert("length of characters can't exceed 200");
        return false;
    }
    return true;
}

function formatCommon(str,dSize){
    var realLength = 0,
        len = str.length,
        charCode = -1,retStr="";
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 256) {
            realLength += 1;
        } else {
            realLength += 2;
        }
        if (realLength < dSize) {
            retStr+=str[i];
        } else {
            realLength = 0;
            retStr+=str[i]+"<br>";
        }
    }
    return retStr;
}
//获取指定acl名称的acl的相关配置信息
function showACLcon(name){
    var data = {};
    data.acl_name = name;
    var ok_ = function(Res) {
        getAcldatas2(Res.data.acls[0])
    },
    err_ = function() {};
    Op.fn.display("/acl/get_by_name", data, ok_, err_);
}
function getAcldatas2(data) {
    addordel = 1;
    $("#aclposition").hide();
    $("input:text[name='aclName']").val(data["acl_name"]);
    $("input:text[name='aclName']").prop('disabled', true);
    $("input:text[name='acl_comment']").val(data["acl_comment"]);
    if (data.action == 1) {
        $("#action").selectpicker('val', 'permit');
    } else {
        $("#action").selectpicker('val', 'deny');
    }
    if (data.filter_active== 1) {
        $("#packetFilter").selectpicker('val', 'filterPacked_yes');
    } else {
        $("#packetFilter").selectpicker('val', 'filterPacked_no');
    }  
    if (data.filter_drop_log == 1) {
        $("input[name=dropLog_yes]").checkbox('check');
    } else {
        $("input[name=dropLog_yes]").checkbox('uncheck');
    }
    //IP层
    if (data.src_addr_not == 1) {
        $("#not1").checkbox('check');
    }
    
    if (data.src_addr_type == 2) {//源地址对象
        $("#ipTypeSource").selectpicker('val','sourAddressObj');
        $('#sourtog1').css('display','inline-block');
        $('#sourtog2').css('display','none');
        $('#sourtog4').css('display','none');
        $('#sourtog6').css('display','none');
        $('#src_not').css('display','inline-block');
        $("#addrobj1").selectpicker('val', data.src_addr_obj); //下拉框选中
    } else if (data.src_addr_type == 3) {//源地址范围
        $("#ipTypeSource").selectpicker('val','sourAddressScope')
        $('#sourtog4').css('display','inline-block');
        $('#sourtog1').css('display','none');
        $('#sourtog2').css('display','none');
        $('#sourtog6').css('display','none');
        $('#src_not').css('display','inline-block');
        $("input:text[name='sourStartIpValue']").val(data.src_addr_ip);
        $("input:text[name='sourEndIpValue']").val(data.src_addr_mask);
    } else if(data.src_addr_type == 1){//源IP地址
        $("#ipTypeSource").selectpicker('val','sourIpAddress')
        $('#sourtog2').css('display','inline-block');
        $('#sourtog1').css('display','none');
        $('#sourtog4').css('display','none');
        $('#sourtog6').css('display','none');
        $('#src_not').css('display','inline-block');
        $("input:text[name='sourIpValue']").val(data.src_addr_ip);
        $("input:text[name='sourMask']").val(data.src_addr_mask);
    } else{
        /*只有当源动态地址组配了之后编辑时单选按钮选择它，若源没有配置，跟添加时保持一致*/
        if(data.src_daddr != ""){
            $("#ipTypeSource").selectpicker('val','sourDyAddress')
            $('#sourtog1').css('display','none');
            $('#sourtog2').css('display','none');
            $('#sourtog4').css('display','none');
            $('#sourtog6').css('display','inline-block');
            $('#src_not').css('display','none');
            $("#dyaddr1").selectpicker('val', data.src_daddr); //下拉框选中
        }else{
            $("#ipTypeSource").selectpicker('val','sourIpAddress')
            $('#sourtog2').css('display','inline-block');
            $('#sourtog1').css('display','none');
            $('#sourtog4').css('display','none');
            $('#sourtog6').css('display','none');
            $('#src_not').css('display','inline-block');
            $("input:text[name='sourIpValue']").val(data.src_addr_ip);
            $("input:text[name='sourMask']").val(data.src_addr_mask);
        }
    }
    //目的IP
    if (data.dst_addr_not == 1) {
        $("#not2").checkbox('check');
    }
    
    if (data.dst_addr_type == 2) {//目的地址对象
        $("#ipTypeDest").selectpicker('val','desAddressObj');
        $('#desttog1').css('display','inline-block');
        $('#desttog2').css('display','none');
        $('#desttog4').css('display','none');
        $('#desttog6').css('display','none');
        $('#dst_not').css('display','inline-block');
        $("#addrobj2").selectpicker('val', data.dst_addr_obj); //下拉框选中
    } else if (data.dst_addr_type == 3) {//目的地址范围
        $("#ipTypeDest").selectpicker('val','desAddressScope');
        $('#desttog4').css('display','inline-block');
        $('#desttog1').css('display','none');
        $('#desttog2').css('display','none');
        $('#desttog6').css('display','none');
        $('#dst_not').css('display','inline-block');
        $("input:text[name='desStartIpValue']").val(data.dst_addr_ip);
        $("input:text[name='desEndIpValue']").val(data.dst_addr_mask);
    } else if(data.dst_addr_type == 1){//目的IP地址
        $("#ipTypeDest").selectpicker('val','desIpAddress');
        $('#desttog2').css('display','inline-block');
        $('#desttog1').css('display','none');
        $('#desttog4').css('display','none');
        //$('#desttog6').show();
        /*modified by bxm for bug20220*/
        $('#desttog6').css('display','none');
        $('#dst_not').css('display','inline-block');
        $("input:text[name='desIpValue']").val(data.dst_addr_ip);
        $("input:text[name='desMask']").val(data.dst_addr_mask);
    } else{
        /*只有当目的动态地址组配了之后编辑时单选按钮选择它，若目的没有配置，跟添加时保持一致*/
        if(data.dst_daddr != ""){
            $("#ipTypeDest").selectpicker('val','desDyAddress');
            $('#desttog1').css('display','none');
            $('#desttog2').css('display','none');
            $('#desttog4').css('display','none');
            $('#desttog6').css('display','inline-block');
            $('#dst_not').css('display','none');
            $("#dyaddr2").selectpicker('val', data.dst_daddr); //下拉框选中
        }else{
            $("#ipTypeDest").selectpicker('val','desIpAddress');
            $('#desttog2').css('display','inline-block');
            $('#desttog1').css('display','none');
            $('#desttog4').css('display','none');
            //$('#desttog6').show();
            /*modified by bxm for bug20220*/
            $('#desttog6').css('display','none');
            $('#dst_not').css('display','inline-block');
            $("input:text[name='desIpValue']").val(data.dst_addr_ip);
            $("input:text[name='desMask']").val(data.dst_addr_mask);
        }       
    }

    //网络应用层
    if (data.syn == 1) {
        $("#synFlag").click();
    }
    
    //以下几个的下拉框的显示都有问题需要使用selectpicker的相应事件
    $("#select5_1").selectpicker('val', data.time_object_name); ///时间调度
    $("#select6_1").selectpicker('val', data.usergrp); ///用户角色
    $("#select7_1").selectpicker('val', data.ingress); ///流入网口
    $("#select8_1").selectpicker('val', data.egress); ///流出网口
    $("#select9_1").selectpicker('val', data["app-name"]); ///应用租对象
    $("#acl_sourcearea").selectpicker('val', data["src_zone_name"]);//源域
    $("#acl_aimarea").selectpicker('val', data["dst_zone_name"]);//目的域

    //服务类型
    if (data.service_type == 1) {
        $("#servType").selectpicker('val','serverObj');
        $("#select3_1").selectpicker('val', data.service_obj);
    }
    if (data.service_type == 2) {
        $("#servType").selectpicker('val','customServer');
        if (data.protocol_type == 0) {
            $("#customType").selectpicker('val','protocolName');
            $("#select4_1").selectpicker('val', data.protocol_name);
            $("#select4_1").prop('disabled', false);
            if (data.protocol_name == "tcp" || data.protocol_name == "udp") {
                $("#sourcePort").val(data.protocol_src_port);
                $("#destinPort").val(data.protocol_dst_port);
            }
        }
        if (data.protocol_type == 1) {
            $("#customType").selectpicker('val','protocolNum');
            $("#select4_1").prop('disabled', true);
            $("#proScopeValue").prop('disabled', false);
            $("#proScopeValue").val(data.protocol_num);
            if(data.protocol_num==6||data.protocol_num==17){
                $("#sourcePort").val(data.protocol_src_port);
                $("#destinPort").val(data.protocol_dst_port);
            }
        }
    }

    $("input:text[name='sourceMac']").val(data.src_mac);
    $("input:text[name='destMac']").val(data.dst_mac);

        //IP报文头
    if (data.dscp != "") {
        $("input:checkbox[name='dscpChk']").checkbox('enable');
        $("input:checkbox[name='dscpChk']").checkbox('check');
        $("input:text[name='dscp']").val(data.dscp);
        $("input:text[name='dscp']").prop('disabled', false);
        $("input:checkbox[name='tosChk']").checkbox('disable');
        $("input:checkbox[name='precedenceChk']").checkbox('disable');
    }
    if (data.tos != "") {
        $("input:checkbox[name='tosChk']").checkbox('enable');
        $("input:checkbox[name='tosChk']").checkbox('check');
        $("#tosselect").selectpicker('val', data.tos);
        $("#tosselect").removeProp('disabled');//('disabled', false);
        $("#tosselect").selectpicker('refresh');
        $("input:checkbox[name='dscpChk']").checkbox('disable');
        $("input:checkbox[name='precedenceChk']").checkbox('enable');
    }
    if (data.precedence != "") {
        $("input:checkbox[name='precedenceChk']").checkbox('enable');
        $("input:checkbox[name='precedenceChk']").checkbox('check');
        $("input:text[name='precedence']").val(data.precedence);
        $("input:text[name='precedence']").prop('disabled', false);
        $("input:checkbox[name='dscpChk']").checkbox('disable');
        $("input:checkbox[name='tosChk']").checkbox('enable');
    }
    if (data.ttl != "") {
        $("input:text[name='ttl']").val(data.ttl);
    }
    if (data.fragment == 1) { //分片标志
        $("input:checkbox[name='shardFlag']").checkbox('check');
    }


    //内外网域地址
    //内网
    if (data.inner_addr_not == 1) {
        $("#not3").checkbox('check');
    }
    if (data.inner_addr_type == 2) {
        $("#ipTypeInner").selectpicker('val','innerAddressObj');
        $('#innertog1').show();
        $('#innertog2').hide();
        $('#innertog4').hide();
        $("#addrobj3").selectpicker('val', data.inner_addr_obj); //下拉框选中
    } else if (data.inner_addr_type == 3) {
        $("#innerAddressScope").radiof('check');
        $("#ipTypeInner").selectpicker('val','innerAddressScope');
        $('#innertog4').show();
        $('#innertog1').hide();
        $('#innertog2').hide();
        $("input:text[name='intrStartIpValue']").val(data.inner_addr_ip);
        $("input:text[name='intrEndIpValue']").val(data.inner_addr_mask);
    } else {
        $("#ipTypeInner").selectpicker('val','innerIpAddress');
        $('#innertog2').show();
        $('#innertog1').hide();
        $('#innertog4').hide();
        $("input:text[name='intrIpValue']").val(data.inner_addr_ip);
        $("input:text[name='intrMask']").val(data.inner_addr_mask);
    }


    //外网
    if (data.outer_addr_not == 1) {
        $("#not4").checkbox('check');
    }
    if (data.outer_addr_type == 2) {
        $("#ipTypeOuter").selectpicker('val','outAddressObj');
        $('#outtog1').show();
        $('#outtog2').hide();
        $('#outtog4').hide();
        $("#addrobj4").selectpicker('val', data.outer_addr_obj); //下拉框选中
    } else if (data.outer_addr_type == 3) {
        $("#ipTypeOuter").selectpicker('val','outAddressScope');
        $('#outtog4').show();
        $('#outtog1').hide();
        $('#outtog2').hide();
        $("input:text[name='outStartIpValue']").val(data.outer_addr_ip);
        $("input:text[name='outEndIpValue']").val(data.outer_addr_mask);
    } else {
        $("#ipTypeOuter").selectpicker('val','outIpAddress');
        $('#outtog2').show();
        $('#outtog1').hide();
        $('#outtog4').hide();
        $("input:text[name='outIpValue']").val(data.outer_addr_ip);
        $("input:text[name='outMask']").val(data.outer_addr_mask);
    }
    //会话日志
    if (data.session_timeout == 0) { //会话超时时间
        $("input:text[name='sessionKeepTime']").val("");
    } else {
        $("input:text[name='sessionKeepTime']").val(data.session_timeout);
    }

    if (data.session_create_log == 1) { //会话创建时记录日志
        sesaddlog = 1;
        $("input:checkbox[name='sessionNew']").checkbox('check');
        logFlag=1;
    }
    if (data.session_destory_log == 1) { //会话删除时记录日志
        sesdellog = 1;
        $("input:checkbox[name='sessionDel']").checkbox('check');
        logFlag=1;
    }
} //回显结束

/*时间对象的赋值，在时间对象和安全策略编辑对象两个地方复制操作相同，引用同一函数*/
//回显数据时需要完善时间的格式
function modifyTimeFormat(timestr, splitStr){
    var sdas = timestr.split(splitStr);
    for (var i = 0; i < sdas.length; i++) {
        //如果等与1需要补齐2位
        if (sdas[i].length == 1) {
            sdas[i] = '0'+sdas[i];
        };
    };
    var modTimestr = sdas[0]+splitStr+sdas[1]+splitStr+sdas[2];
    return modTimestr;
} 
// 获取时间对象信息回显到界面上
function showTimeCon(data) {
    $("#timeName").val(data.objtimename);
    $("#timeName").attr('readonly', 'readonly');
    $("#comment").val(data.comment);
    if (data.startdate == undefined) {
        //周期调度回显
        //点击radiobutton 跳转周调度
        $("#weekMethod").click();
        $("#sundayStartTime").val(data.sun != undefined ? data.sun.split("-")[0] : "");
        $("#sundayEndTime").val(data.sun != undefined ? data.sun.split("-")[1] : "");
        $("#mondayStartTime").val(data.mon != undefined ? data.mon.split("-")[0] : "");
        $("#mondayEndTime").val(data.mon != undefined ? data.mon.split("-")[1] : "");
        $("#tuesdayStartTime").val(data.tue != undefined ? data.tue.split("-")[0] : "");
        $("#tuesdayEndTime").val(data.tue != undefined ? data.tue.split("-")[1] : "");
        $("#wednesdayStartTime").val(data.wed != undefined ? data.wed.split("-")[0] : "");
        $("#wednesdayEndTime").val(data.wed != undefined ? data.wed.split("-")[1] : "");
        $("#thursdayStartTime").val(data.thu != undefined ? data.thu.split("-")[0] : "");
        $("#thursdayEndTime").val(data.thu != undefined ? data.thu.split("-")[1] : "");
        $("#fridayStartTime").val(data.fri != undefined ? data.fri.split("-")[0] : "");
        $("#fridayEndTime").val(data.fri != undefined ? data.fri.split("-")[1] : "");
        $("#saturdayStartTime").val(data.sat != undefined ? data.sat.split("-")[0] : "");
        $("#saturdayEndTime").val(data.sat != undefined ? data.sat.split("-")[1] : "");
        //判断全选框是否选中
        if (data.sun == "00:00:00-23:59:59")
            $("#sunall").click();
        if (data.mon == "00:00:00-23:59:59")
            $("#monall").click();
        if (data.tue == "00:00:00-23:59:59")
            $("#tueall").click();
        if (data.wed == "00:00:00-23:59:59")
            $("#wedall").click();
        if (data.thu == "00:00:00-23:59:59")
            $("#thuall").click();
        if (data.fri == "00:00:00-23:59:59")
            $("#friall").click();
        if (data.sat == "00:00:00-23:59:59")
            $("#satall").click();
    } else {
        //点击radiobutton 跳转一次调度
        $("#oneMethod").click();
        
        var modstartdate = modifyTimeFormat(data.startdate, '/');
        var modstarttime = modifyTimeFormat(data.starttime, ':');
        var modstopdate = modifyTimeFormat(data.stopdate, '/');
        var modstoptime = modifyTimeFormat(data.stoptime, ':');
        $("#startTime").val(modstartdate + " " + modstarttime);
        $("#endTime").val(modstopdate + " " + modstoptime);
    }
}  
/*时间对象赋值结束*/
// 获取时间对象组信息回显到界面上//与时间对象组的赋值数据略不同，不可合并
function showGroupName(data) {
    $("#groupname").val(data.objtimegrpname);
    $("#groupname").attr('readonly', 'readonly');
    $("#comment").val(data.comment);
    var sellist = new Array();
    $.each(data.objtimegrpmeb, function(index, item){
        sellist.push(item["member"]);
    })
    $("#memberlist").selectpicker('val', sellist);
    // $("#memberlist").selectpicker('refresh');
}
 //动态地址集合
function InitDyAddrData(data){
    var result = data;
    $("input:text[name='dyn_addr_name']").prop('disabled', true);
    $("input:text[name='dyn_addr_name']").val(result['name']);
    $("input:text[name='comment']").val(result['comment']);
    var objType = "";
    if(result.uuid){        objType += ("uuid "+result.uuid + ";");                 }
    if(result.guestos){     objType += ("guestos "+result.guestos+ ";");            }
    if(result.vmname){      objType += ("vmname "+result.vmname+ ";");              }
    if(result.annotation){  objType += ("annotation "+result.annotation + ";");     }
    if(result.network){     objType += ("network "+result.network+ ";");            }
    if(result.resourcepool){objType += ("resourcepool "+result.resourcepool+ ";");  }
    if(result.cluster){     objType += ("cluster "+result.cluster+ ";");            }
    if(result.host){        objType += ("host "+result.host+ ";");                  }
    if(result.project){     objType += ("project "+result.project+ ";");            }
    if(objType.length){
        objType = objType.substring(0,objType.length-1); 
        var members = objType.split(";");
        for (var i = 0; i < members.length; i++) {
            //解码
            //var str=utf8to16(base64decode(members[i].member));
            $("#MyPillbox ul").pillbox('addItem', members[i]);
        }
    }
}
//动态地址集合
function InitDyAddrGrpData(data){
    var result = data;
    $("input:text[name='daddrgroupname']").prop("disabled", false);
    var flag = 1;
    $("input:hidden[name='flag']").val(flag);
    $("input:text[name='daddrgroupname']").val(result['name']);
    $("input:text[name='daddrgroupname']").prop("disabled", true);
    $("input:text[name='dcomment']").val(result['comment']);
    var arr = [];
    $.each(result.member, function(index, item){
        arr.push(item.mbrname);
    })
    $("#select2").selectpicker('val', arr);
    $("input:hidden[name='dMemberList']").val(arr);
}
//地址对象
function InitAddrData(data){
    var result = data;
    $("input:text[name='objaddrname']").prop('disabled', true);
    $("input:text[name='objaddrname']").val(result["objaddress"]);
    $("input:text[name='objaddrip']").val(result["ip"]);
    if (result["ip"]) {
        $("input:radio[name='address'][value=1]").radiof('check');
        $('#scope_').show();
        $('#network_').hide();
        $('#disip_').hide();
        $('#disip_pillbox').hide();
    } else if (result["leftip"]) {
        $("input:radio[name='address'][value=2]").radiof('check');
        $('#scope_').hide();
        $('#network_').show();
        $('#disip_').hide();
        $('#disip_pillbox').hide();
    } else {
        $("input:radio[name='address'][value=3]").radiof('check');
        $('#scope_').hide();
        $('#network_').hide();
        $('#disip_').show();
        $('#disip_pillbox').show();
    }
    $("#select1").selectpicker('val', result['netmask']);
    $("input:text[name='objaddrleft']").val(result["leftip"]);
    $("input:text[name='objaddrright']").val(result["rightip"]);
    $("input:text[name='comment']").val(result["comment"]);
    $.each(result["discrete"], function(index, item){
        $("#MyPillbox ul").pillbox('addItem', item.ip, item.ip);
    })
}
//地址对象组
function InitAddrGrpData(data){
    var result = data;
    $("input:text[name='addrgroupname']").prop("disabled", false);
    var flag = 1;
    $("input:hidden[name='flag']").val(flag);
    $("input:text[name='addrgroupname']").val(result['GroupName']);
    $("input:text[name='addrgroupname']").prop("disabled", true);
    $("input:text[name='comment']").val(result['comment']);
    var arr = [];
    $.each(result["groupmeb"], function(index, item){
        arr.push(item.member);
    })
    $("#select2").selectpicker('val', arr);
}
//请求域对象
function initArea(data){
    $("#areaname").val(data.zonename);
    $("#areaname").attr('readonly', 'readonly');
    $("#comment").val(data.comment);
    var members = data.zonemeb;
    var sellist = new Array();
    $.each(members, function(index, val) {
        sellist.push(val["member"]);
    });
    $("#areaInter").selectpicker('val', sellist);
}
//请求url分类数据
function initURL(data){
    var result = data;
    var groupName = result['urlgroupname'];
    var flag = 1;
    $("input:hidden[name='editName']").val(flag);
    $("input:text[name='groupName']").val(groupName);
    $("input:text[name='groupName']").prop('disabled', true);
    //左侧下拉菜单
    var leftArr = result['left'];
    $.each(leftArr, function(i, nLeft) {
        //  中文的情况  英文关键字en_name
        var lang_name;
        if($.cookie('ck_language')=='CN'){
            lang_name = nLeft["ch_name"];
        }else{
            lang_name = nLeft["en_name"];
        }
        var str = nLeft["id"] + " " + lang_name;
        var id = nLeft["id"];
        if (id >= 200) {
            var n = lang_name;
            $("#URLAll").append('<option value=' + n + ' name=' + id + '>' + str + '</option>');
        } else {
            //var n1=nItem["id"];
            $("#URLAll").append('<option value=' + id + ' name=' + id + '>' + str + '</option>');
        }
    });
    var rightArr = result['right'];
    $.each(rightArr, function(i, nLeft) {
        //  中文的情况  英文关键字en_name
        if (!jQuery.isEmptyObject(nLeft)) {
            var lang_name;
            if($.cookie('ck_language')=='CN'){
                lang_name = nLeft["ch_name"];
            }else{
                lang_name = nLeft["en_name"];
            }
            var str = nLeft["id"] + " " + lang_name;
            var id = nLeft["id"];
            if (id >= 200) {
                var n = lang_name;
                if (str != undefined) {
                    $("#selBlock").append('<option value=' + n + ' name=' + id + '>' + str + '</option>');
                }
            } else {
                $("#selBlock").append('<option value=' + id + ' name=' + id + '>' + str + '</option>');
            }
        }
    });
}
//请求应用对象
function initApp(data){
    var obj = data;
    if(obj.filter_app.length==0){  
        $.app_obj_filter = "";
    }else{
        $.app_obj_filter = obj.filter_app;
    }
    $("input:text[name='appName']").prop('disabled', true);
    $.method_ = "edit";
    $("input[name='comment']").val(data.comment);
    if (obj.relation && obj.relation == 1) {
        $("input[name='filter'][value=1]").radiof('check');
    } else {
        $("input[name='filter'][value=0]").radiof('check');
    }
    $.each(obj.groupmbr, function(index1, item1){
        $("#"+item1.group_name).attr('checked', true);
        var pId = $("#"+item1.group_name).parents("tr").attr("data-tt-id");
        $.each($("#appTable tr[data-tt-parent-id="+pId+"]"),function(index, item){
            $(item).find("input[class=sub-group]").attr('checked',true);
        })
    });

    if (obj.category == 'all') {
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol1"), 'all', 'cate_bs');
    }else if(obj.category){
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol1"), obj.category, 'cate_bs');
    }
    if (obj.subcate == 'all') {
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol2"), 'all', 'subcate_voip');
    }else if(obj.subcate){
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol2"),obj.subcate, 'subcate_voip');
    }
    if (obj.technology == 'all') {
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol3"), 'all', 'tech_cs');
    }else if(obj.technology){
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol3"), obj.technology, 'tech_cs');
    }
    if (obj.risk == 'all') {
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol4"), 'all', 'risk');
    }else if(obj.risk){
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol4"), obj.risk, 'risk');
    }
    if (obj.charact == 'all') {
        setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol5"), 'all', 'char_tran');
    }else if(obj.charact){
         setNodesChecked($.fn.zTree.getZTreeObj("treeProtocol5"), obj.charact, 'char_tran');
    }

    function setNodesChecked(trees, arr, type) {
        var data_,
            rightNodes = trees.getNodes(),
            nodes = trees.transformToArray(rightNodes);
        for (var i = 0; i < nodes.length; i++) {
            if(arr == 'all'){
                trees.checkNode(nodes[i], true, true);
                savePillboxSetValue(nodes[i].name, type);
            }else{ 
                if(arr){
                    $.each(arr, function(index, val) {
                        if ((i + 1) == val.name) {
                            trees.checkNode(nodes[i], true, true);
                            savePillboxSetValue(nodes[i].name, type);
                        }
                    });
                } 
            } 
        }
    }

    var app_obj = obj.appmbr; //appmbr  app_zh_name  app_name
    if (app_obj && app_obj.length > 0) {
        $.each(app_obj, function(index, val) {
            // pillBoxSetValue((window.lang=='zh-CN')?val.app_zh_name:val.app_name);
            savePillboxSetValue(val.app_name, 'level3', '');
        })
    }
    var groupmbr = obj.groupmbr;
    if (groupmbr && groupmbr.length > 0) {
        $.each(groupmbr, function(index, val) {
            savePillboxSetValue(val.group_name, 'level1', '');
        })
    }
    var subgrpmbr = obj.subgrpmbr;
    if (subgrpmbr && subgrpmbr.length > 0) {
        $.each(subgrpmbr, function(index, val) {
            savePillboxSetValue(val.subgrp_name, 'level2', '');
        })
    }
   /*var app_obj_filter = obj.filter_app; //appmbr  app_zh_name  app_name 
    if (app_obj_filter && app_obj_filter.length > 0) {
        $.each(app_obj_filter, function(index, val) {
            //导致页面缓慢
            //pillBoxSetValue((window.lang == 'zh-CN') ? val.zh_name : val.name);
        })
    }*/

    function pillBoxSetValue(nodes) {
        $('#MyPillbox ul').pillbox('addItem', nodes, 'level3');
        $('#MyPillbox ul li').addClass('status-info');
    }

    function savePillboxSetValue(nodes, type) {
        $('#MyPillbox_2 ul').pillbox('addItem', nodes, type);
        $('#MyPillbox_1 ul').pillbox('addItem', nodes, type);
    }
    $.groupmbr = obj.groupmbr ? obj.groupmbr : '';
    $.subgrpmbr = obj.subgrpmbr ? obj.subgrpmbr : '';
    $.appmbr = obj.appmbr ? obj.appmbr : '';
    $.category = obj.category ? obj.category : '';
    $.subcate = obj.subcate ? obj.subcate : '';
    $.technology = obj.technology ? obj.technology : '';
    $.risk = obj.risk ? obj.risk : '';
    $.charact = obj.charact ? obj.charact : '';
}
//线路
function InitLinkData(data){
    setTimeout(function(){
        var result = data;
        $("#name").val(data.pipenm);
        $("#name").attr('disabled',true);
        $("#comm").val(data.pipecomm);
        $.each($('#interfaceUsed option'), function(index, item){
            if(item.innerText == data.outer_interface){
                $(this).appendTo("#selout");
                $("#toRight1").hide();
                $("#toLeft1").show();
                $("#toLeft1").show();        
                $("#toRight1").removeClass("right_enable");
                $("#toRight1").addClass("right_disable");
                $("#toLeft1").removeClass("left_disable");
                $("#toLeft1").addClass("left_enable");
            }
        });
        
        if(data.inner_interface){
            var inner = "";
            for(var i=0; i<data.inner_interface.length; i++){
                inner += (data.inner_interface[i].trim() + "; ");
            }
            data.inner_interface = "";
            data.inner_interface = inner.substr(0, inner.length-2);
        }
        var impressList = data["inner_interface"].split("; ");
        for(var i=0; i<impressList.length; i++){
            $.each($('#interfaceAll option'), function(index, item){
                if($(item).val() == impressList[i]){
                    $(this).appendTo("#selInner");
                    $("#toRight").removeClass("right_disable");
                    $("#toRight").addClass("right_enable");
                    $("#toLeft").removeClass("left_disable");
                    $("#toLeft").addClass("left_enable");
                }
            });
        }
        
        $("#oldInnerInterface").val(data.inner_interface);
        $("#oldOuterInterface").val(data.outer_interface);
        $("#oldInner").val(data.inner_interface);
    },100)
    
}
//初始化流控规则
function initFlowRuleData(data){
    $.method_ = "edit";
    $.perActionName = data.aname;
    $("input[type=text][name=actionName]").val(data.aname);
    $("input[type=text][name=upBand]").val(data.enm.up);
    $("input[type=text][name=downBand]").val(data.enm.dw);
    $("input[type=text][name=maxConnect]").val(data.enm.maxco);
    $("input[type=text][name=maxNewConnect]").val(data.enm.maxra);
    $("input[type=text][name=per_upBand]").val(data.per.up);
    $("input[type=text][name=per_downBand]").val(data.per.dw);
    $("input[type=text][name=per_maxConnect]").val(data.per.maxco);
    $("input[type=text][name=per_maxNewConnect]").val(data.per.maxra);
    $("input[type=text][name=per_inmaxConnect]").val(data.per.inco);
    $("input[type=text][name=per_outmaxConnect]").val(data.per.outco);
    if(data.prio){
        $("input:checkbox[name='ip']").checkbox('check');
        $("input:checkbox[name='dp']").checkbox('uncheck');
        $("input:checkbox[name='dp']").checkbox('disable');
        $("select.selectpicker[name='prece']").selectpicker('val', data.prio); //下拉列表选中
        $("select.selectpicker[name='prece']").prop('disabled', false);
        $("select.selectpicker[name='prece']").selectpicker('refresh');
        $("select.selectpicker[name='dscp']").prop('disabled', true);
        $("select.selectpicker[name='dscp']").selectpicker('refresh');
    }else if(0===data.dscp || data.dscp){
        $("input:checkbox[name='dp']").checkbox('check');
        $("input:checkbox[name='ip']").checkbox('uncheck');
        $("input:checkbox[name='ip']").checkbox('disable');
        $("select.selectpicker[name='dscp']").selectpicker('val', data.dscp); //下拉列表选中  
        $("select.selectpicker[name='dscp']").prop('disabled', false);
        $("select.selectpicker[name='dscp']").selectpicker('refresh');
        $("select.selectpicker[name='prece']").prop('disabled', true);
        $("select.selectpicker[name='prece']").selectpicker('refresh');
    }else{
        $("input:checkbox[name='dp']").checkbox('uncheck');
        $("input:checkbox[name='ip']").checkbox('uncheck');
        $("input:checkbox[name='dp']").checkbox('enable');
        $("input:checkbox[name='ip']").checkbox('enable');
        $("select.selectpicker[name='dscp']").prop('disabled', true);
        $("select.selectpicker[name='dscp']").selectpicker('refresh');
        $("select.selectpicker[name='prece']").prop('disabled', true);
        $("select.selectpicker[name='prece']").selectpicker('refresh');
    }
}
//请求动态地址或动态地址集合的函数
function dyAddrReq(daddr){
    var data = {};
    data.objectname = daddr;
    var ok_ = function(Res) {
        if(Res.data.daddr != undefined){//动态地址集合
            configShow("/webApp/management/g_dyAddrAdd.html", $.i18n.prop("wglang--105170"), $.i18n.prop("wglang--102815"), '670' ,InitDyAddrData , Res.data.daddr[0]);
        }else{            //动态地址集合组
            configShow("/webApp/management/g_dyAddrAddGroup.html", $.i18n.prop("wglang--105120"), $.i18n.prop("wglang--102815"), '650',InitDyAddrGrpData, Res.data.daddrgrp[0]);
        }
    },
    err_ = function() {};
    Op.fn.display("/objaddr/getbyname", data, ok_, err_);
}
//请求地址对象或地址组的函数
function addrReq(addr){
    var data = {};
    data.objectname = addr;
    var ok_ = function(Res) {
        if(Res.data.objaddr != undefined){//地址对象
            configShow("/webApp/management/g_addrObjAdd.html", $.i18n.prop("wglang--101921"), $.i18n.prop("wglang--102815"), '750', InitAddrData, Res.data.objaddr[0]);
        }else{            //地址对象组
            configShow("/webApp/management/g_addrGroupAdd.html", $.i18n.prop("wglang--101933"), $.i18n.prop("wglang--102815"), '650', InitAddrGrpData, Res.data.objaddrgrp[0]);
        }
    },
    err_ = function() {};
    Op.fn.display("/objaddr/getbyname", data, ok_, err_);
}
//请求线路
function linkReq(link){
    var data = {};
    data["phy_link"] = link;
    var ok_ = function(Res) {
        configShow("/webApp/network/flow_pipe_config.html",$.i18n.prop("wglang--105324"), $.i18n.prop("wglang--102815"), '800', InitLinkData, Res.data);
    },
    err_ = function() {};
    Op.fn.display("/dp/itm/pipe/certain/get", data, ok_, err_);
}
//请求流控规则
function flowRuleReq(rule){
    var data = {};
    data.aname = rule;
    var ok_ = function(Res) {
        configShow("/webApp/policy/n_flowCtrlRuleAdd.html",$.i18n.prop("wglang--103799"), $.i18n.prop("wglang--102815"), '800', initFlowRuleData, Res.data);
        $.method_ = "edit";
        $("input[type=text][name=actionName]").attr('disabled',true);
    },
    err_ = function() {};
    Op.fn.display("/dp/itm/action/certain/get", data, ok_, err_);
    
}
//tooltip显示的地址对象数据
 function getAddr_p(data){
    var addr = "";
    if(data["ip"] != undefined){
        addr = data["objaddress"] + " : " +data["ip"] + "/" + data["netmask"];
    }else if(data["leftip"] != undefined){
        addr = data["objaddress"] + " : " +data["leftip"] + "-" + data["rightip"];
    }else{
        addr = data["objaddress"] + " : ";
        $.each(data["discrete"], function(index, item){
            addr += (item["ip"]+"; ");
        })
        addr.substr(0,addr.length-2);
    }
    return addr;
}
//tooltip显示的地址组数据
function getAddrGrp_p(data){
    var grpAddr = "";
    $.each(data, function(index, item){
        grpAddr += getAddr_p(item)+"\n";
    });
    return grpAddr;
}
//tooltip显示的动态地址集合数据
function getDaddr_p(data){
    var daddr = "";
    daddr += data["objname"] + " : ";
    if(data.uuid){
        daddr += ("uuid "+data.uuid + "; ");
    }
    if(data.guestos){
        daddr += ("guestos "+data.guestos+ "; ");
    }
    if(data.vmname){
        daddr += ("vmname "+data.vmname+ "; ");
    }
    if(data.annotation){
        daddr += ("annotation "+data.annotation + "; ");
    }
    if(data.network){
        daddr += ("network "+data.network+ "; ");
    }
    if(data.resourcepool){
        daddr += ("resourcepool "+data.resourcepool+ "; ");
    }
    if(data.cluster){
        daddr += ("cluster "+data.cluster+ "; ");
    }
    if(data.host){
        daddr += ("host "+data.host+ "; ");
    }
    if(data.project){
        daddr += ("project "+data.project+ "; ");
    }
    if(daddr.length){
        daddr = daddr.substring(0,daddr.length-2);
    }
    return daddr;
}
//tooltip显示的动态地址集合组数据
function getDaddrGrp_p(data){
    var daddrGrp = "";
    $.each(data.member, function(index, item){
        daddrGrp += (getDaddr_p(item) + "\n");
    });
    return daddrGrp;
}
//tooltip显示的时间对象数据
function getTime_p(data){
    var time = "";
    if(data["timeonce"] != undefined){
        var dd = data["timeonce"][0];
        time += dd["objtimename"] + " : " + dd["startdate"] + " " + dd["starttime"] + " - " + dd["stopdate"] + " " + dd["stoptime"];
    }else if(data["timeweek"] != undefined){
        var dd = data["timeweek"][0];
        time += dd["objtimename"] + " : " + 
                (dd["sun"] != undefined ? "sun " + dd["sun"] + "\n" : "") + 
                (dd["mon"] != undefined ? "mon " + dd["mon"] + "\n" : "") + 
                (dd["tue"] != undefined ? "tue " + dd["tue"] + "\n" : "") + 
                (dd["wed"] != undefined ? "wed " + dd["wed"] + "\n" : "") + 
                (dd["thu"] != undefined ? "thu " + dd["thu"] + "\n" : "") + 
                (dd["fri"] != undefined ? "fri " + dd["fri"] + "\n" : "") + 
                (dd["sat"] != undefined ? "sat " + dd["sat"] : "");
    }else if(data["timegrp"] != undefined){
		for(var i=0; i<data["timegrp"][0]["timegrpmeb"].length; i++){
			var item = data["timegrp"][0]["timegrpmeb"][i][0];
			if(item["startdate"] != undefined){
				time += item["objtimename"] + " : " + item["startdate"] + " " + item["starttime"] + " - " + item["stopdate"] + " " + item["stoptime"]+"\n";
			}else{
				time += item["objtimename"] + " : " + 
				(item["sun"] != undefined ? "sun " + item["sun"] + "\n" : "") + 
				(item["mon"] != undefined ? "mon " + item["mon"] + "\n" : "") + 
				(item["tue"] != undefined ? "tue " + item["tue"] + "\n" : "") + 
				(item["wed"] != undefined ? "wed " + item["wed"] + "\n" : "") + 
				(item["thu"] != undefined ? "thu " + item["thu"] + "\n" : "") + 
				(item["fri"] != undefined ? "fri " + item["fri"] + "\n" : "") + 
				(item["sat"] != undefined ? "sat " + item["sat"] + "\n" : "");
			}
		}
		time = time.substr(0, time.length-2);
	}
    return time;
}
//tooltip显示的url分类数据
function getURL_p(data){
    var str = [];
    var obj = {};
    var grpName = Op.fn.strAnsi2Unicode(Op.fn.Base64Decode(data['urlgroupname']));
    var arr = data['category'];
    var grpMem = "";
    grpMem += (grpName + " : ");
    $.each(arr, function(i, n) {
        if($.cookie('ck_language')=='CN'){
            grpMem += n['id'] + n['ch_name'] + " ";
        }else{
            grpMem += n['id'] + n['en_name'] + " ";
        }
    })
    return grpMem;
}
//tooltip显示的应用组对象数据
function getAppTooltip(data){
    var appTitle = "";
    var appObj = data["app-object_item"];
    var name = $.cookie('ck_language')=='CN'?"zh_name":"name";
    if(appObj != undefined){
        if(appObj["mbr-grp"].length != 0){
            appTitle += $.i18n.prop("wglang--102955") + " : ";//"group : ";
            var mg = appObj["mbr-grp"];
            for(var i=0; i<mg.length; i++){
                appTitle += (mg[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["mbr-sub"].length != 0){
            appTitle += $.i18n.prop("wglang--105482") + " : ";//"sub-group : ";
            var ms = appObj["mbr-sub"];
            for(var i=0; i<ms.length; i++){
                appTitle += (ms[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["mbr-app"].length != 0){
            appTitle += $.i18n.prop("wglang--106038") + " : ";//"app : ";
            var app = appObj["mbr-app"];
            for(var i=0; i<app.length; i++){
                appTitle += (app[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["mbr-acc"].length != 0){
            var acc = appObj["mbr-acc"];
            for(var i=0; i<acc.length; i++){
                appTitle += ($.i18n.prop("wglang--105635") + " : "+ acc[i][name].replace(",", " ") + "\n");//;"account : 
            }
        }
        if(appObj["filter-cate"].length != 0){
            appTitle += $.i18n.prop("wglang--102925") + " : ";//"category : ";
            var cate = appObj["filter-cate"];
            for(var i=0; i<cate.length; i++){
                appTitle += (cate[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["filter-subcate"].length != 0){
            appTitle += $.i18n.prop("wglang--102008") + " : ";//"sub-catetory : ";
            var sub_cate = appObj["filter-subcate"];
            for(var i=0; i<sub_cate.length; i++){
                appTitle += (sub_cate[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["filter-tech"].length != 0){
            appTitle += $.i18n.prop("wglang--102195") + " : ";//"technology : ";
            var tech = appObj["filter-tech"];
            for(var i=0; i<tech.length; i++){
                appTitle += (tech[i][name] + " ");
            }
            appTitle += "\n";
        }
        if(appObj["filter-risk"].length != 0){
            appTitle += $.i18n.prop("wglang--103625") + " : ";//"risk : ";
            var risk = appObj["filter-risk"];
            for(var i=0; i<risk.length; i++){
                appTitle += (risk[i].name + " ");
            }
            appTitle += "\n";
        }
        if(appObj["filter-char"].length != 0){
            appTitle += $.i18n.prop("wglang--102090") + " : ";//"characteristics : ";
            var char = appObj["filter-char"];
            for(var i=0; i<char.length; i++){
                appTitle += (char[i][name] + " ");
            }
            appTitle += "\n";
        }
        appTitle += ($.i18n.prop("wglang--103408") + " : " + (appObj["relation"]=="or"?$.i18n.prop("wglang--102184"):$.i18n.prop("wglang--101567")));//"relation : "
    }
    return appTitle;
}
//tooltip显示的线路数据
function getLinkData(data){
    var linkData = data["policy_phy_link"];
    var linkTooltip = "";
    if(linkData["pipenm"]){
        linkTooltip += ($.i18n.prop("wglang--101727") + " : "+linkData["outer_interface"] + "\n");
        linkTooltip += ($.i18n.prop("wglang--105323") + " : "+linkData["inner_interface"].join(" ") + "\n");
    }
    return linkTooltip;
}
//tooltip显示的流控规则数据
function getFlowRuleData(data){
    var flowData = data["policy_action_map"];
    var flowTooltip = "";
    if(flowData.aname){
        var enm = flowData.enm;
        var per = flowData.per;
        flowTooltip +=     $.i18n.prop("wglang--102346") + " : \n" +
                        $.i18n.prop("wglang--101522") + " : " + enm.up + " kbps; " +
                        $.i18n.prop("wglang--101544") + " : " + enm.dw + " kbps;\n" +
                        $.i18n.prop("wglang--102461") + " : " + enm.maxco + "; " +
                        $.i18n.prop("wglang--102460") + " : " + enm.maxra + ";\n" +
                        $.i18n.prop("wglang--101812") + " : \n" +
                        $.i18n.prop("wglang--101522") + " : " + per.up + " kbps; " +
                        $.i18n.prop("wglang--101544") + " : " + per.dw + " kbps;\n" +
                        $.i18n.prop("wglang--102461") + " : " + per.maxco + "; " +
                        $.i18n.prop("wglang--102460") + " : " + per.maxra + ";\n" +
                        $.i18n.prop("wglang--101722") + " : " + per.inco + "; " +
                        $.i18n.prop("wglang--101994") + " : " + per.outco + ";\n"+
                        (flowData.prio!="" ? "IP Precedence : "+flowData.prio+"\n" : "")+ 
                        (flowData.dscp!="" ? "DSCP : "+flowData.dscp+"\n" : "");
    }
    return flowTooltip;
}
function check_gatewayip(netstr,mask){
    var netstr = netstr;
    var mask = mask;

    var net = netstr.split('.');
    var netnum = (256*256*256)*parseInt(net[0]) + (256*256)*parseInt(net[1]) + 256*parseInt(net[2]) + parseInt(net[3]);
    var masknum = parseInt(mask);

    if ((netnum << masknum) != 0){
            $.fn.tdialog({
                type: "info",
                'content': "请检查掩码前IP地址！"/*"请检查网关范围！"*/
            });
            return false;
    }else{
        return true;
    }
}

function check_gateway(networkmask,gateway){
    var netstr = networkmask.split('/')[0];
    var mask = networkmask.split('/')[1];
    var gatewaystr = gateway;

    /*检查掩码前IP*/
    if(check_gatewayip(netstr,mask) == false){
        return false
    }

    var net = netstr.split('.');
    var netnum = (256*256*256)*parseInt(net[0]) + (256*256)*parseInt(net[1]) + 256*parseInt(net[2]) + parseInt(net[3]);

    var gateway = gatewaystr.split('.');
    var gatewaynum = (256*256*256)*parseInt(gateway[0]) + (256*256)*parseInt(gateway[1]) + 256*parseInt(gateway[2]) + parseInt(gateway[3]);
    var _net = (netnum >> (32 - parseInt(mask)));
    var _gateway = (gatewaynum >> (32 - parseInt(mask)));
    var temp = gatewaynum << parseInt(mask);
    if (_net == _gateway){
            /*不应该直接判断最后一个ip段，应该按照掩码进行计算*/
            /*if(gateway[3] == '0' || gateway[3] == "255"){
                $.fn.tdialog({
                    type: "info",
                    'content': "请检查网关范围！"
                });
                return false;
            }*/
            if(temp == 0){
                $.fn.tdialog({
                    type: "info",
                    'content': "请检查网关范围！"/*"请检查网关范围！"*/
                });
                return false;
            }
            if (temp == (((1 << parseInt(mask)) - 1) << parseInt(mask))) {
                $.fn.tdialog({
                    type: "info",
                    'content': "请检查网关范围！"/*"请检查网关范围！"*/
                });
                return false;                      
            }
            return true;
    } else {
            $.fn.tdialog({
                type: "info",
                'content': "请检查网关范围！"/*"请检查网关范围！"*/
            });
            return false;
    }
}


/** url编码相关参数 **/
function opUrlStringToAscii(str){ 
  return str.charCodeAt(0).toString(16); 
} 

function opUrlAsciiToString(asccode){ 
  return String.fromCharCode(asccode); 
} 

/** 
* Url编码 未测
**/ 
function opUlrEncode(unzipStr){ 
    var zipstr=""; 
    var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%"; 
    var tt= ""; 
    for (var i=0;i<unzipStr.length;i++) { 
        var chr = unzipStr.charAt(i); 
        var c=opUrlStringToAscii(chr); 
        tt += chr+":"+c+"n"; 
        if(parseInt("0x"+c) > 0x7f){ 
            zipstr+=encodeURI(unzipStr.substr(i,1)); 
        } else { 
            if(chr==" ") 
                zipstr+="+"; 
            else if(strSpecial.indexOf(chr)!=-1) 
                zipstr+="%"+c.toString(16); 
            else 
                zipstr+=chr; 
        }
    } 
    return zipstr; 
} 

/** 
* Url解码  测试通过
**/ 
function opUrlDecode (zipStr) { 
    var uzipStr=""; 
    for (var i=0;i<zipStr.length;i++) { 
        var chr = zipStr.charAt(i); 
        if (chr == "+") { 
            uzipStr+=" "; 
        } else if(chr=="%") { 
            var asc = zipStr.substring(i+1,i+3); 
            if(parseInt("0x"+asc)>0x7f){ 
                uzipStr+=decodeURI("%"+asc.toString()+zipStr.substring(i+3,i+9).toString()); ; 
                i+=8; 
            } else { 
                uzipStr+=opUrlAsciiToString(parseInt("0x"+asc)); 
                i+=2; 
            } 
        } else { 
            uzipStr+= chr; 
        } 
    } 
    return uzipStr; 
}
//echarts需要显示工具箱时 处理多语言问题 调用此方法
 function echarts_(eId){
    var myChart = echarts.init(document.getElementById(eId));
    var defaultSettings = {        
        //工具箱
        toolbox: {
            feature: {
                //辅助线标志，3个图标, 分别是启用，删除上一条，删除全部，可设置更多属性
                //可传入lineStyle（详见lineStyle）控制线条样式
                mark: {
                    show: true,
                    title: {
                        mark: $.i18n.prop("wglang--103701"),//'辅助线开关',
                        markUndo: $.i18n.prop("wglang--103702"),//'删除辅助线',
                        markClear: $.i18n.prop("wglang--103703") //'清空辅助线'
                    },
                    lineStyle: {
                        width: 2,
                        color: '#1e90ff',
                        type: 'dashed'
                    }
                },
                magicType: {
                    show: true,
                    title: {
                        line: $.i18n.prop("wglang--103705"),//'折线图切换',
                        bar: $.i18n.prop("wglang--103706"),//'柱形图切换',
                        stack: $.i18n.prop("wglang--103707"),//'堆积',
                        tiled: $.i18n.prop("wglang--103708") //'平铺'
                    },
                    type: ['line', 'bar']
                },
                //还原，复位原始图表
                restore: {
                    show: true,
                    title: $.i18n.prop("wglang--103709") //'还原'
                },
                // 保存图片（IE8-不支持），可设置更多属性
                // {string=} type 默认保存图片类型为'png'，需改为'jpeg'
                // {string=} name 指定图片名称，如不指定，则用图表title标题，如无title标题则图片名称默认为“ECharts”
                // {string=} lang 非IE浏览器支持点击下载，有保存话术，默认是“点击保存”，可修改
                saveAsImage: {
                    show: true,
                    title: $.i18n.prop("wglang--103710"),//'保存为图片',
                    type: 'png',
                    lang: [ $.i18n.prop("wglang--103711") ]//['点击保存']
                }
            }
        }
    }; 
    myChart.setOption(defaultSettings); 
    return myChart;
} 

/**判断上传文件大小*/
function fileSelected(id,fileSize) {
    //id 上传文件file的id  fileSize 上传文件限制大小 
    var file = document.getElementById(id).files[0];
    if(file==undefined){
        return true;//未选择文件时不做判断
    }
    if (file) {  
        if (file.size > fileSize){ 
            return false;      
        }else{
            return true;
        }
    }
}
