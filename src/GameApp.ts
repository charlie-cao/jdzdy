/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class GameApp extends egret.DisplayObjectContainer{

    /**
     * 加载进度界面
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }

    private onAddToStage(event:egret.Event){
        //注入自定义的素材解析器
        egret.Injector.mapClass("egret.gui.IAssetAdapter",AssetAdapter);
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        egret.gui.Theme.load("resource/theme.thm");

        //设置加载进度界面
        this.loadingView  = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.loadConfig("resource/resource.json","resource/");
    }
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event:RES.ResourceEvent):void{
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.loadGroup("preload");
    }
    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            this.createGameScene();
        }
    }
    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.loadingView.setProgress(event.itemsLoaded,event.itemsTotal);
        }
    }
    public static Game:GameApp;

    private textContainer:egret.Sprite;

    private btnRestart;
    private btnTeamList;
    private btnTeamTop;
    private btnShare;

    private gameOverTitle:egret.TextField;

    private topMask:egret.Shape;
    private icon:egret.Bitmap;
    private title:egret.TextField;
    private tnameT;
    private teaminfo;
    private unameT;
    private userinfo;

    private resLL:egret.Bitmap;
    private resBook:egret.Bitmap;
    private resSoap:egret.Bitmap;

    private resTimeCount:egret.Bitmap;
    private resBookCount:egret.Bitmap;

    private mouth:egret.Shape;
    private books:egret.Bitmap[] = [];

    private _lastTime:number;
    private enemyFightersTimer:egret.Timer = new egret.Timer(1000);
    private gameTime:egret.Timer = new egret.Timer(1000);
    private nowTime:number = 0;

    private bookCount:number = 0;

    private nowTimeTextField:egret.TextField ;
    private bookCountTextField:egret.TextField ;

    private toplist:egret.TextField;


    private urlloader:egret.URLLoader= new egret.URLLoader();
    private urlloader2:egret.URLLoader= new egret.URLLoader();
    private urlloader_teaminfo:egret.URLLoader= new egret.URLLoader();

    private tip:egret.TextField;

//    private getQueryString(name) {
//        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
//        var r = window.location.search.substr(1).match(reg);
//        if (r != null) return unescape(r[2]); return null;
//    }
    private stageW;
    private stageH;

    private addBg(){
        var sky:egret.Bitmap = this.createBitmapByName("bgImage");
        this.gameLayer.addChild(sky);
        sky.width = this.stageW;
        sky.height = this.stageH;
    }

    private addMask(){
        this.topMask = new egret.Shape();
        this.topMask.graphics.beginFill(0x000000, 0.5);
        this.topMask.graphics.drawRect(0, 0, this.stageW, this.stageH);
        this.topMask.graphics.endFill();
        this.topMask.width = this.stageW;
        this.topMask.height = this.stageH;
        this.gameLayer.addChild(this.topMask);
    }

    private addIcon(){
        this.icon = this.createBitmapByName("Icon");
//        this.icon.anchorX = this.icon.anchorY = 0.5;
        this.gameLayer.addChild(this.icon);
        this.icon.x = this.stageW / 2;
        this.icon.y = 150;
    }

    private addTip(){
        var textContainer:egret.Sprite = new egret.Sprite();
        textContainer.anchorX = textContainer.anchorY = 0.5;
        this.gameLayer.addChild(textContainer);
        textContainer.x = this.stageW / 2;
        textContainer.y = 280;
        textContainer.alpha = 0;
        this.textContainer = textContainer;
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        RES.getResAsync("description",this.startAnimation,this)
    }

    private addTeamName(){
        this.tnameT = new egret.TextField();
        this.tnameT.width = this.stageW/2;
        this.tnameT.x = 0;
        this.tnameT.y = 340;
        this.tnameT.textColor = 0xffffff;
        this.tnameT.textAlign = "center";
        this.tnameT.text = "-舰队-";
        this.tnameT.size = 20;
        this.gameLayer.addChild(this.tnameT);

        this.unameT = new egret.TextField();
        this.unameT.width = this.stageW/2;
        this.unameT.x = this.stageW/2;
        this.unameT.y = 340;
        this.unameT.textColor = 0xffffff;
        this.unameT.textAlign = "center";
        this.unameT.text = "-舰员-";
        this.unameT.size = 20;
        this.gameLayer.addChild(this.unameT);


    }

    private addCopyRight(){
        var label:egret.TextField = new egret.TextField();
//        label.text = "© Q Game 2014";
        label.text = "© 小名堂 2014";
        label.size = 12;
        label.x = (this.stageW - label.width)/2;
        label.y = this.stageH - label.height;
        this.gameLayer.addChild( label );
    }

    /**
     * 创建舰队
     */
    private btnCreateTeam;
    private digCreateTeam;
    private tnameInput;
    private tnametext;
    private showCreateTeam(y){
        this.btnCreateTeam = new egret.gui.Button();
        this.btnCreateTeam.label = "创建我的舰队";
        this.btnCreateTeam.horizontalCenter = 0;
        this.btnCreateTeam.y = y;
        this.btnCreateTeam.addEventListener(egret.TouchEvent.TOUCH_TAP,this.clickBtnCreateTeam,this);
        this.guiLayer.addElement(this.btnCreateTeam);
    }

    private clickBtnCreateTeam(event:egret.TouchEvent):void{
        var uid = this.getCookie("uid");

        if(uid==null){
            alert("请先报到");
            return;
        };



        this.digCreateTeam = new egret.gui.TitleWindow();
        this.digCreateTeam.showCloseButton = true;
        this.digCreateTeam.title = "创建我的舰队";
        this.digCreateTeam.width = 400;
        this.digCreateTeam.height = 240;

        this.tnameInput = new egret.TextInput();
        this.tnameInput.text = "";
        var tname:egret.gui.UIAsset = new egret.gui.UIAsset(this.tnameInput);
        this.digCreateTeam.addElement(tname);

        var btn:egret.gui.Button = new egret.gui.Button();
        btn.label = "保存";
        btn.horizontalCenter = 0;
        btn.verticalCenter = 0;
        btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.btnSaveTeamName,this);
        this.digCreateTeam.addElement(btn);
        this.digCreateTeam.addEventListener(egret.gui.CloseEvent.CLOSE,this.closeSaveTeamName,this);
        egret.gui.PopUpManager.addPopUp(this.digCreateTeam,true,true);
    }
    private btnSaveTeamName(evt:egret.TouchEvent):void {
        var uid = this.getCookie("uid");
        if(uid==null){
            alert("请先报到");
            return;
        };
        if(this.tnameInput.text.length>8){
            alert("名字不能超过八个字");
            return;
        }
        if(this.tnameInput.text.length<2){
            alert("名字不能少于两个字");
            return;
        }
        if(this.tnameInput.text == ""){
            alert("请输入舰队名称");
        }else{
            //创建新团队
            try{
                //修改当前舰队名称 保存舰队ID
                this.tnametext = this.tnameInput.text;
                this.tnameT.text = "舰队:"+this.tnametext;
                this.unameT.text = "舰员:"+this.unametext;
//                this.title.text = "舰队:"+this.tnametext+" 舰长:"+this.unametext;

                var urlreq:egret.URLRequest = new egret.URLRequest();
                urlreq.url = "./launcher/api.php?a=createTeam&name="+this.tnametext+"&uid="+uid;
                this.urlloader.load( urlreq );
                this.urlloader.addEventListener(egret.Event.COMPLETE, this.onCreateTeamComplete, this);
            }catch(e){
                console.log(e);
            }
        }
    }
    private closeSaveTeamName(evt:egret.gui.CloseEvent):void {
        egret.gui.PopUpManager.removePopUp(this.digCreateTeam);
    }
    private onCreateTeamComplete(event:egret.Event):void
    {
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onCreateTeamComplete, this);
        try{
            console.log("onCreateTeamComplete");
            console.log( this.urlloader.data );
            eval("var data = "+this.urlloader.data);
            if(eval("data.msg")=="success"){
                //修改当前舰队名称 保存舰队ID
                this.guiLayer.removeElement(this.btnCreateTeam);
                this.tid = eval("data.data.tid");
                this.setCookie("tid",this.tid);
                //创建舰队后的更新分享到新舰队。
                this.teaminfo.score=0;
                share(0,this.tid,0,this.tnametext,0);

                egret.gui.PopUpManager.removePopUp(this.digCreateTeam);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }


    /**
     * 创建用户
     */
    private btnCreateUser;
    private dlgCreateUser;
    private unameInput;
    private unametext;
    private showCreateUser(y){
        this.btnCreateUser = new egret.gui.Button();
        this.btnCreateUser.label = "我要报到";
        this.btnCreateUser.horizontalCenter = 0;
        this.btnCreateUser.y = y;
        this.btnCreateUser.addEventListener(egret.TouchEvent.TOUCH_TAP,this.clickBtnCreateUser,this);
        this.guiLayer.addElement(this.btnCreateUser);

        /*提前创建*/
        this.dlgCreateUser = new egret.gui.TitleWindow();
        this.dlgCreateUser.showCloseButton = true;
        this.dlgCreateUser.title = "输入您的名字";
        this.dlgCreateUser.width = 400;
        this.dlgCreateUser.height = 240;

        this.unameInput = new egret.TextInput();
        this.unameInput.text = "";
        var uname:egret.gui.UIAsset = new egret.gui.UIAsset(this.unameInput);
        this.dlgCreateUser.addElement(uname);

        var btn:egret.gui.Button = new egret.gui.Button();
        btn.label = "保存";
        btn.horizontalCenter = 0;
        btn.verticalCenter = 0;
        btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.btnSaveUserName,this);
        this.dlgCreateUser.addElement(btn);
        this.dlgCreateUser.addEventListener(egret.gui.CloseEvent.CLOSE,this.closeSaveUserName,this);

    }
    private clickBtnCreateUser(event:egret.TouchEvent):void{

        egret.gui.PopUpManager.addPopUp(this.dlgCreateUser,true,true);
    }
    private btnSaveUserName(evt:egret.TouchEvent):void {
        if(this.unameInput.text.length>8){
            alert("名字不能超过八个字");
            return;
        }
        if(this.unameInput.text.length<2){
            alert("名字不能少于两个字");
            return;
        }
        if(this.unameInput.text == ""){
            alert("请输入您的大名");
        }else{
            //创建新用户
            try{
                this.unametext = this.unameInput.text;
                this.unameT.text = "舰员:"+this.unametext;

                var urlreq:egret.URLRequest = new egret.URLRequest();

                //如果战舰已经建立，需要舰员登舰
                if(this.tid){
                    urlreq.url = "./launcher/api.php?a=createUser&name="+this.unametext+"&tid="+this.tid;
                }else{
                    urlreq.url = "./launcher/api.php?a=createUser&name="+this.unametext;
                }
                this.urlloader.load( urlreq );
                this.urlloader.addEventListener(egret.Event.COMPLETE, this.onCreateUserComplete, this);

                //切换按钮 隐藏我要报到 显示修改大名
                this.guiLayer.removeElement(this.btnCreateUser);
                this.showChangeUserName(288+200);
            }catch(e){
                console.log(e);
            }
        }
    }
    private closeSaveUserName(evt:egret.gui.CloseEvent):void {
        egret.gui.PopUpManager.removePopUp(this.dlgCreateUser);
    }
    private onCreateUserComplete(event:egret.Event):void
    {
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onCreateUserComplete, this);
        try{
            console.log("onCreateUserComplete");
            console.log( this.urlloader.data );

            eval("var data = "+this.urlloader.data);
            if(eval("data.msg")=="success"){

                //保存用户的id 和名字到Cookie中
                this.setCookie("uid",eval("data.data.uid"));
                this.uid = this.getCookie("uid");

                egret.gui.PopUpManager.removePopUp(this.dlgCreateUser);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }

    }




    private btnStart;
    private showPlayGame(y){
        this.btnStart =  new egret.gui.Button();
        this.btnStart.label = "为舰队抢金币";
        this.btnStart.horizontalCenter = 0;
        this.btnStart.y = y;
        this.btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP,this.gameStart,this);
        this.guiLayer.addElement(this.btnStart);
    }

    private btnChangeUserName;
    private dlgChangeUserName;
    private unameChangeInput;
    private showChangeUserName(y){
        this.btnChangeUserName = new egret.gui.Button();
        this.btnChangeUserName.label = "修改大名";
        this.btnChangeUserName.horizontalCenter = 0;
        this.btnChangeUserName.y = y;
        this.btnChangeUserName.addEventListener(egret.TouchEvent.TOUCH_TAP,this.clickBtnChangeUserName,this);
        this.guiLayer.addElement(this.btnChangeUserName);
    }

    private clickBtnChangeUserName(event:egret.TouchEvent):void{
        this.dlgChangeUserName = new egret.gui.TitleWindow();
        this.dlgChangeUserName.showCloseButton = true;
        this.dlgChangeUserName.title = "输入新名子";
        this.dlgChangeUserName.width = 400;
        this.dlgChangeUserName.height = 240;

        this.unameChangeInput = new egret.TextInput();
        this.unameChangeInput.text = this.unametext;
        var uname:egret.gui.UIAsset = new egret.gui.UIAsset(this.unameChangeInput);
        this.dlgChangeUserName.addElement(uname);

        var btn:egret.gui.Button = new egret.gui.Button();
        btn.label = "保存";
        btn.horizontalCenter = 0;
        btn.verticalCenter = 0;
        btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.btnClickChangeUserName,this);
        this.dlgChangeUserName.addElement(btn);
        this.dlgChangeUserName.addEventListener(egret.gui.CloseEvent.CLOSE,this.closeChangeUserName,this);
        egret.gui.PopUpManager.addPopUp(this.dlgChangeUserName,true,true);
    }
    private btnClickChangeUserName(evt:egret.TouchEvent):void {
        var uid = this.getCookie("uid");
        if(this.unameChangeInput.text.length>8){
            alert("名字不能多于八个字");
            return;
        }
        if(this.unameChangeInput.text.length<2){
            alert("名字不能少于两个字");
            return;
        }

        if(this.unameChangeInput.text == ""){
            alert("请输入您的大名");
        }else{
            //创建新用户
            try{
                this.unametext = this.unameChangeInput.text;
                this.unameT.text = "舰员:"+this.unametext;
                var urlreq:egret.URLRequest = new egret.URLRequest();
                urlreq.url = "./launcher/api.php?a=changeUName&uid="+uid+"&name="+this.unametext;
                this.urlloader.load( urlreq );
                this.urlloader.addEventListener(egret.Event.COMPLETE, this.onChangeUserComplete, this);
            }catch(e){
                console.log(e);
            }
        }
    }
    private closeChangeUserName(evt:egret.gui.CloseEvent):void {
        egret.gui.PopUpManager.removePopUp(this.dlgChangeUserName);
    }
    private onChangeUserComplete(event:egret.Event):void
    {
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onChangeUserComplete, this);
        try{
            console.log("onChangeUserComplete");
            console.log( this.urlloader.data );
            eval("var data = "+this.urlloader.data);
            if(eval("data.msg")=="success"){
                //保存用户的id 和名字到Cookie中
                egret.gui.PopUpManager.removePopUp(this.dlgChangeUserName);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }

    }

    private setCookie(name,value)
    {
        var Days = 3000;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        console.log(exp);
        document.cookie = name + "="+  (value) + ";expires=Sun, 04 Dec 2022 08:06:45 GMT";
    }
    private getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

        if(arr=document.cookie.match(reg))

            return (arr[2]);
        else
            return null;
    }
    private getUrl(){
        return location.search;
    }

    private getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]); return null;
}

    private getTeam(tid){
        var urlreq:egret.URLRequest = new egret.URLRequest();
        urlreq.url = "./launcher/api.php?a=getTeam&tid="+tid;
        this.urlloader.load( urlreq );
        this.urlloader.addEventListener(egret.Event.COMPLETE, this.onGetTeamComplete, this);
    }
    private onGetTeamComplete(){
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onGetTeamComplete, this);
        try{
            console.log("onGetTeamComplete");
            console.log( this.urlloader.data );

            eval("var tdata = "+this.urlloader.data);
            if(eval("tdata.msg")=="success"){
                this.teaminfo = eval("tdata.data");
                this.tnametext = eval("tdata.data.name");
                this.tnameT.text = "舰队:"+this.tnametext;
                share(1,this.tid,this.teaminfo.score,this.tnametext,0);

                console.log(this.tnametext);
                console.log(this.tnameT.text);
//                this.setCookie("tname",this.tnametext);
            }else{
                alert("数据错误");
            }
//            this.toplist.text = "您在全宇宙"+eval("data.count")+"名玩家中排"+eval("data.top")+"位";
        }catch(e){
            console.log(e);
        }
    }

    private getUser(uid){
        var urlreq:egret.URLRequest = new egret.URLRequest();
        urlreq.url = "./launcher/api.php?a=getUser&uid="+uid;
        this.urlloader2.load( urlreq );
        this.urlloader2.addEventListener(egret.Event.COMPLETE, this.onGetUserComplete, this);
    }
    private onGetUserComplete(){
        this.urlloader2.removeEventListener(egret.Event.COMPLETE, this.onGetUserComplete, this);
        try{
            console.log("onGetUserComplete");
            console.log( this.urlloader2.data );

            eval("var udata = "+this.urlloader2.data);
            if(eval("udata.msg")=="success"){
                this.unametext = eval("udata.data.name");
                this.unameT.text = "舰员:"+this.unametext;
                console.log(this.unameT.text);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }

    private gameLayer:egret.DisplayObjectContainer;

    private guiLayer:egret.gui.UIStage;

    /**
     * 创建游戏场景
     */
    private tid=null;
    private uid=null;

    private createGameScene():void{

        this.gameLayer = new egret.DisplayObjectContainer();
        this.addChild(this.gameLayer);

        var debug:egret.TextField = new egret.TextField();
        debug.text = "Debug";
        debug.size = 12;
        debug.width = this.stageW;
        debug.height = this.stageH/2;
        debug.x = 0;
        debug.y = 0;
        var msg = "";


        this.tid = this.getQueryString("tid")? this.getQueryString('tid') : this.getCookie('tid');
        this.uid = this.getCookie("uid");
        if(this.tid!=null){
            console.log("load tinfo");
            this.getTeam(this.tid);
            this.setCookie("tid",this.tid);
        }else{
            //如果没有tid 清除链接
            document.cookie = "tid=;expires=Sun, 04 Dec 2002 08:06:45 GMT";
            document.cookie = "uid=;expires=Sun, 04 Dec 2002 08:06:45 GMT";
            document.cookie = "tname=;expires=Sun, 04 Dec 2002 08:06:45 GMT";
            document.cookie = "uname=;expires=Sun, 04 Dec 2002 08:06:45 GMT";
            this.uid = null;
        }

        if(this.uid!=null){
            this.getUser(this.uid);
        }else{

        }

        msg += "tid:"+this.tid+"\r\n";
        msg += "uid:"+this.uid+"\r\n";
        msg += "url:"+this.getUrl()+"\r\n";
        debug.text = msg;


        GameApp.Game = this;

        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;
        this.addBg();
        this.addMask();
//        this.addChild( debug );
        this.addIcon();
        this.addTeamName();
        this.addTip();
        this.addCopyRight();
        //舰队名称 根据cookie中的唯一ID从数据库中获取

//        tid = null;
        //测试Uid为空
//        this.uid = null;
        msg += "tid:"+this.tid+"\r\n";
        msg += "uid:"+this.uid+"\r\n";
        msg += "url:"+this.getUrl()+"\r\n";
        debug.text = msg;

        this.guiLayer = new egret.gui.UIStage();
        this.addChild(this.guiLayer);

        if ( !this.tid ) {//无舰队
            if ( !this.uid ) {
                //创建自己的舰队
                this.showCreateTeam(288+100);
                //点击创建自己的舰队弹层，填写舰队名字，点击确定之后出下面的按钮
                //我要报到
                this.showCreateUser(288+200);
                //点击我要报到交互同上，点确认之后出下面的按钮
                //为舰队抢金币
                this.showPlayGame(288+300);

                //////console.log("Time Over");
//                egret.gui.PopUpManager.addPopUp(this.dlgCreateUser,true,true);

            } else {
                //这种情况初始化出来的页面有三个按钮从上往下依次是
                //为舰队抢金币
                this.showPlayGame(288+100);
                //修改大名
                this.showChangeUserName(288+200);
                //创建自己的舰队
                this.showCreateTeam(288+300);
            }
        }else {//舰队标示，说明他点击了某个舰长或者队员分享的舰队的链接
            //已经获取舰队总人数了 再增加一个当前用户是否在其中
            share(0,this.tid,0,"我们的",0);

            if ( this.uid ) {
                if(typeof(this.tnametext) != "undefined"){
                    this.tnameT.text = "舰队:"+this.tnametext;
                }else{
                    this.tnameT.text = "-舰队-";

                }
                if(typeof(this.unametext) != "undefined"){
                    this.unameT.text = "舰员:"+this.unametext;
                }else{
                    this.unameT.text = "-舰员-";

                }

                //查询用户是否在舰队中
                //请求含有uid的检查链接，返回的是是否在舰队中 0|1
                var urlreq:egret.URLRequest = new egret.URLRequest();
                urlreq.url = "./launcher/api.php?a=checkUserTeam&tid="+this.tid+"&uid="+this.uid;
                this.urlloader_teaminfo.load( urlreq );
                this.urlloader_teaminfo.addEventListener(egret.Event.COMPLETE, this.onCheckUserTeam, this);

            } else {//用户没有身份
                this.tnameT.text = "舰队:"+this.tnametext;
                this.showCreateUser(288+200);
                //点击我要报到之后,判断当前舰队成员是否已满，如果未满

                //请求不含有uid的检查链接，返回的是team的成员数
                var urlreq:egret.URLRequest = new egret.URLRequest();
                urlreq.url = "./launcher/api.php?a=checkUserTeam&tid="+this.tid;
                this.urlloader_teaminfo.load( urlreq );
                this.urlloader_teaminfo.addEventListener(egret.Event.COMPLETE, this.onCheckUserTeam2, this);
            }
        }
    }


    private onCheckUserTeam(){
        this.urlloader_teaminfo.removeEventListener(egret.Event.COMPLETE, this.onCheckUserTeam, this);
        try{
            console.log("onCheckUserTeam");
            console.log( this.urlloader_teaminfo.data );

            eval("var data = "+this.urlloader_teaminfo.data);
            if(eval("data.msg")=="success"){
                var data = eval("data.data");
                 if ( data.inteam ==1 ) {
                     //为舰队抢金币
                     this.showPlayGame(288+100);
                     //修改大名
                     this.showChangeUserName(288+200);
                     //创建自己的舰队
                     this.showCreateTeam(288+300);
                     //这个时候用户可以直接玩游戏
                     //可以选择修改名字或者重新自己创建一个舰队
                     //如果用户选择创建了自己的舰队，那么进去玩游戏的成果归属于他新创建的舰队
                 } else {//判断舰队是否满员
                     if ( data.total_user >=15 ) {
                         alert("该舰队成员已满请创建您的舰队");
                         //修改大名
                         this.showChangeUserName(288+100);
                         //创建自己的舰队
                         this.showCreateTeam(288+200);
                     } else {
                         //为舰队抢金币
                         this.showPlayGame(288+100);
                         //修改大名
                         this.showChangeUserName(288+200);
                         //创建自己的舰队
                         this.showCreateTeam(288+300);
                     }
                 }
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }

    private onCheckUserTeam2(){
        this.urlloader_teaminfo.removeEventListener(egret.Event.COMPLETE, this.onCheckUserTeam2, this);
        try{
            console.log("onCheckUserTeam2");
            console.log( this.urlloader_teaminfo.data );

            eval("var data = "+this.urlloader_teaminfo.data);
            if(eval("data.msg")=="success"){
                var data = eval("data.data");
                if ( data.total_user <15 ) {
                    //为舰队抢金币
                    this.showPlayGame(288+300);
                    //创建自己的舰队
                    this.showCreateTeam(288+100);
                } else {
                    alert("该舰队成员已满请创建您的舰队")
                    //创建自己的舰队
                    this.showCreateTeam(288+100);
                }
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }

    private gameStart():void{
        if(this.uid==null){
            alert("请先报到");
            return ;
        }
        if(this.tid==null){
            alert("请先创造舰队");
            return ;
        }

        this.guiLayer.removeAllElements();
        this.gameLayer.removeChild(this.topMask);
        this.gameLayer.removeChild(this.icon);
        this.gameLayer.removeChild(this.tnameT);
        this.gameLayer.removeChild(this.unameT);
        this.gameLayer.removeChild(this.textContainer);
        this.gameInit();

    }

    private gameInit():void{

        try{
            this.gameLayer.removeChild(this.resLL);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.mouth);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.bookCountTextField);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.nowTimeTextField);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.resTimeCount);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.resBookCount);
        }catch(e){}
        try{
            this.gameLayer.removeChild(this.gameOverTitle);
        }catch(e){}
        try{
            for(var i:number=0;i<this.books.length;i++){
                this.gameLayer.removeChild(this.books[i]);
            }
        }catch(e){}

        this.resLL = this.createBitmapByName("resLL");
//        this.resLL.anchorX = 0.5;
        this.resLL.width = 150;
        this.resLL.height = 150;
        this.resLL.x = (this.stage.stageWidth - this.resLL.width)/2 ;
        this.resLL.y = this.stage.stageHeight - this.resLL.height - 8;
        this.gameLayer.addChild(this.resLL);

        this.mouth = new egret.Shape();
        this.mouth.width = 30;
        this.mouth.height =20;
        this.mouth.x = (this.stage.stageWidth - this.mouth.width)/2 ;
        this.mouth.y = this.stage.stageHeight - this.resLL.height + 20;
//        this.mouth.graphics.beginFill( 0xff0000, 1);
//        this.mouth.graphics.drawRect( 0, 0, 30, 20 );
//        this.mouth.graphics.endFill();
        this.gameLayer.addChild(this.mouth);

        this.resTimeCount = this.createBitmapByName("resTimeCount");
        this.resTimeCount.x = 20;
        this.resTimeCount.y = 20;
        this.gameLayer.addChild(this.resTimeCount);
        this.resBookCount = this.createBitmapByName("resBookCount");
        this.resBookCount.x = this.stage.stageWidth - this.resBookCount.width - 20;
        this.resBookCount.y = 20;
        this.gameLayer.addChild(this.resBookCount);

        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
        this.addEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
        this.enemyFightersTimer.addEventListener(egret.TimerEvent.TIMER,this.createBook,this);
        this.enemyFightersTimer.start();

        //初始化时间 和 吃掉的书的计数
        this.gameTime.addEventListener(egret.TimerEvent.TIMER,this.fGameTime,this);
        this.gameTime.start();
        var nowTime:egret.TextField = new egret.TextField();
        nowTime.x = 130;
        nowTime.y = 38;
        nowTime.textColor = 0x8C0000;
        nowTime.textAlign = "center";
        nowTime.text = "0";
        nowTime.size = 50;
        this.nowTimeTextField = nowTime;
        this.gameLayer.addChild(nowTime);
        this.nowTime = 0;


        var bookCount:egret.TextField = new egret.TextField();
        bookCount.x = this.stage.stageWidth - bookCount.width - 20 -80;
        bookCount.y = 38;
        bookCount.textColor = 0x8C0000;
        bookCount.textAlign = "center";
        bookCount.text = "0";
        bookCount.size = 50;
        this.bookCountTextField = bookCount;
        this.gameLayer.addChild(bookCount);
        this.bookCount = 0;


    }

    private dlgTeamTop;
    private teamTopLabelFunction(item:any):string {
        return item.name;
    }
    private onTeamTopComplete(){
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onTeamTopComplete, this);
        try{
            console.log("onTeamTopComplete");
            console.log( this.urlloader.data );

            eval("var tdata = "+this.urlloader.data);
            if(eval("tdata.msg")=="success"){
                var data = eval("tdata.data");
                console.log(data);
                this.dlgTeamTop = new egret.gui.TitleWindow();
                this.dlgTeamTop.showCloseButton = true;
                this.dlgTeamTop.title = "舰队总排行";
                this.dlgTeamTop.width = 400;
                this.dlgTeamTop.height = 600;
                //先创建一个数组
                var sourceArr:any[] = [];
                for (var i:number = 0; i < data.length; i++)
                {
                    sourceArr.push({name:(i+1)+"."+data[i].name+"拥有"+data[i].score+"金币"});
                }
                //用ArrayCollection包装
                var myCollection:egret.gui.ArrayCollection = new egret.gui.ArrayCollection(sourceArr);
                var dataList:egret.gui.List = new egret.gui.List();
                dataList.dataProvider = myCollection;
                dataList.labelFunction = this.teamTopLabelFunction;
                dataList.percentWidth = 100;
                dataList.percentHeight = 100;
                this.dlgTeamTop.addElement(dataList);
                this.dlgTeamTop.addEventListener(egret.gui.CloseEvent.CLOSE,this.closeDlgTeamTop,this);
                egret.gui.PopUpManager.addPopUp(this.dlgTeamTop,true,true);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }
    private closeDlgTeamTop(evt:egret.gui.CloseEvent):void {
        egret.gui.PopUpManager.removePopUp(this.dlgTeamTop);
    }
    private onBtnTeamTop(){
        //获取舰队信息
        var urlreq:egret.URLRequest = new egret.URLRequest();
        urlreq.url = "./launcher/api.php?a=teamTop";
        this.urlloader.load( urlreq );
        this.urlloader.addEventListener(egret.Event.COMPLETE, this.onTeamTopComplete, this);
    }
    private dlgTeamList;
    private teamListLabelFunction(item:any):string {
        return item.name;
    }
    private onTeamListComplete(){
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onTeamListComplete, this);
        try{
            console.log("onTeamListComplete");
            console.log( this.urlloader.data );

            eval("var tdata = "+this.urlloader.data);
            if(eval("tdata.msg")=="success"){
                var data = eval("tdata.data");
                console.log(data);
                this.dlgTeamList = new egret.gui.TitleWindow();
                this.dlgTeamList.showCloseButton = true;
                this.dlgTeamList.title = this.tnametext+"舰队成员";
                this.dlgTeamList.width = 400;
                this.dlgTeamList.height = 600;
                //先创建一个数组
                var sourceArr:any[] = [];
                for (var i:number = 0; i < data.length; i++)
                {
                    sourceArr.push({name:"第"+(i+1)+"名     "+data[i].name+"拥有"+data[i].score+"金币"});
                }
                //用ArrayCollection包装
                var myCollection:egret.gui.ArrayCollection = new egret.gui.ArrayCollection(sourceArr);
                var dataList:egret.gui.List = new egret.gui.List();
                dataList.dataProvider = myCollection;
                dataList.labelFunction = this.teamListLabelFunction;
                dataList.percentWidth = 100;
                dataList.percentHeight = 100;
                this.dlgTeamList.addElement(dataList);
                this.dlgTeamList.addEventListener(egret.gui.CloseEvent.CLOSE,this.closeDlgTeamList,this);
                egret.gui.PopUpManager.addPopUp(this.dlgTeamList,true,true);
            }else{
                alert("数据错误");
            }
        }catch(e){
            console.log(e);
        }
    }
    private closeDlgTeamList(evt:egret.gui.CloseEvent):void {
        egret.gui.PopUpManager.removePopUp(this.dlgTeamList);
    }
    private onBtnTeamList(){
        //获取舰队信息
        var urlreq:egret.URLRequest = new egret.URLRequest();
        urlreq.url = "./launcher/api.php?a=teamList&tid="+this.tid;
        this.urlloader.load( urlreq );
        this.urlloader.addEventListener(egret.Event.COMPLETE, this.onTeamListComplete, this);
    }


    private gameOver(type:number):void{

            for(var book in this.books){
                console.log(book);
                try{
                    this.gameLayer.removeChild(this.books[book]);
                }catch(e){

                }

            }

//        this.guiLayer = new egret.gui.UIStage();
//        this.addChild(this.guiLayer);

        this.touchEnabled = false;
        this.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
        this.removeEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
        this.enemyFightersTimer.stop();
        this.gameTime.stop();



        var that = this;


        this.btnRestart = new egret.gui.Button();
        this.btnRestart.label = "挑战更多金币";
        this.btnRestart.horizontalCenter = 0;
        this.btnRestart.y = 250;
        this.btnRestart.width=200;

        this.btnRestart.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            that.guiLayer.removeAllElements();
            that.gameInit();
        },this);
        this.guiLayer.addElement(this.btnRestart);


        this.btnShare = new egret.gui.Button();
        this.btnShare.label = "邀请更多的船员";
        this.btnShare.horizontalCenter = 0;
        this.btnShare.y = 350;
        this.btnShare.width=200;
        this.btnShare.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            that.topMask = new egret.Shape();
            that.topMask.graphics.beginFill(0x000000, 0.8);
            that.topMask.graphics.drawRect(0, 0, that.stage.width, that.stage.height);
            that.topMask.graphics.endFill();
            that.topMask.width = that.stage.width;
            that.topMask.height = that.stage.height;
            that.topMask.touchEnabled = true;
            that.topMask.addEventListener(egret.TouchEvent.TOUCH_TAP,function (){
                that.removeChild(that.topMask);
                that.removeChild(that.tip);
            },this);


            that.addChild(that.topMask);
            that.tip = new egret.TextField();
            that.tip.y = 20;
            that.tip.size = 26;
            that.tip.textColor = 0xffffff;
            that.tip.text = "转发给朋友或者朋友圈\r\n邀请你的好友成为你的船员\r\n为舰队赚更多的金币";
            that.tip.x = that.stage.width - that.tip.width -20;

            that.addChild(that.tip);
        },this);
        this.guiLayer.addElement(this.btnShare);


        this.btnTeamList = new egret.gui.Button();
        this.btnTeamList.label = "查看我的舰队";
        this.btnTeamList.horizontalCenter = 0;
        this.btnTeamList.y = 450;
        this.btnTeamList.width=200;
        this.btnTeamList.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onBtnTeamList,this);
        this.guiLayer.addElement(this.btnTeamList);

        this.btnTeamTop = new egret.gui.Button();
        this.btnTeamTop.label = "舰队总排行";
        this.btnTeamTop.horizontalCenter = 0;
        this.btnTeamTop.y = 550;
        this.btnTeamTop.width=200;
        this.btnTeamTop.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onBtnTeamTop,this);
        this.guiLayer.addElement(this.btnTeamTop);



        this.toplist = new egret.TextField();
        this.toplist.y = 110;
        this.toplist.size = 26;
        this.toplist.textColor = 0xffffff;
        this.toplist.strokeColor = 0xD90000;
        this.toplist.stroke = 2;
        this.gameLayer.addChild(this.toplist);


        this.gameOverTitle = new egret.TextField();
        this.gameOverTitle.y = 150;
        this.gameOverTitle.size = 36;
        this.gameOverTitle.textColor = 0xffffff;
        this.gameOverTitle.strokeColor = 0xD90000;
        this.gameOverTitle.stroke = 2;
        var title:string;

        if(type==1){
            //正常结束
            if(this.bookCount >=0 && this.bookCount<10){
                this.gameOverTitle.text = "您的荣耀\r\n躲避天王\r\n找罗胖换100本书"
                title = "躲避天王,找罗胖换100本书";
            }else if(this.bookCount >10 && this.bookCount<20){
                this.gameOverTitle.text = "您的荣耀\r\n马虎才子\r\n找罗胖换1本书"
                title = "马虎才子,找罗胖换1本书";
            }else if(this.bookCount >20 && this.bookCount<30){
                this.gameOverTitle.text = "您的荣耀\r\n小才子\r\n找罗胖换2本书"
                title = "小才子,找罗胖换2本书";
            }else if(this.bookCount >30 && this.bookCount<40){
                this.gameOverTitle.text = "您的荣耀\r\n大才子\r\n找罗胖换4本书"
                title = "大才子,找罗胖换4本书";
            }else if(this.bookCount>40){
                this.gameOverTitle.text = "您的荣耀\r\n宇宙无敌大才子。\r\n找罗胖换10本书"
                title = "宇宙无敌大才子,找罗胖换10本书";
            }
        }else{
            //碰到肥皂结束
            title =  "手欠大师,得送罗胖10本书";

            this.gameOverTitle.text = "你坚持了"+this.nowTime+"秒 \r\n为"+this.tnametext+"舰队抢到"+(this.bookCount)+"枚金币";
        }

        try{
            share(1,this.tid,(this.teaminfo.score*1)+(this.bookCount*1),this.tnametext,0);
        }catch(e){}


        try{
            //保存本次游戏得分
            var urlreq:egret.URLRequest = new egret.URLRequest();
            urlreq.url = "./launcher/api.php?a=saveScore&uid="+this.uid+"&tid="+this.tid+"&score="+this.bookCount;
            this.urlloader.load( urlreq );
            this.urlloader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);

        }catch(e){
            console.log(e);
        }

        this.gameOverTitle.textAlign = "center";
        this.gameOverTitle.x = (this.stage.width - this.gameOverTitle.width)/2;
        this.gameLayer.addChild(this.gameOverTitle);
    }

    private onComplete(event:egret.Event):void
    {
        this.urlloader.removeEventListener(egret.Event.COMPLETE, this.onComplete, this);

        try{
            console.log( this.urlloader.data );
//            eval("var data = "+this.urlloader.data);
//            this.toplist.text = "您在全宇宙"+eval("data.count")+"名玩家中排"+eval("data.top")+"位";
//            this.toplist.textAlign = "center";
//            this.toplist.x = (this.stage.width - this.toplist.width)/2;
        }catch(e){
            console.log(e);
        }

//        var stageW:number = this.stage.stageWidth;
//        var stageH:number = this.stage.stageHeight;
//        this.youwin.text =  "您是全国第"+this.urlloader.data+"位围住大锤的人";
//        this.youwin.x = (stageW - this.youwin.width)/2;
//        this.youwin.y = (stageH - this.youwin.height)/2 - 120;
    }

    private fGameTime(evt:egret.TimerEvent):void{
        this.nowTime++;
        this.nowTimeTextField.text = ""+this.nowTime;

//        if(this.nowTime==0){
//            this.gameOver(1);
//            console.log("game over");
//        }

    }

    private createBook(evt:egret.TimerEvent):void{

        console.log("createBook");

        console.log(Math.random());
        if(Math.random()*10 > 6){
            var book =  this.createBitmapByName("resSoap");
            book.name = "soap";
            book.width = 108/100*80;
            book.height = 144/100*80;

        }else{
            var book =  this.createBitmapByName("resBook");
            book.name = "book";
            book.width = 80;
            book.height = 80;

        }


        book.x = Math.random()*(this.stage.stageWidth - book.width);
        book.y = -book.height-Math.random()*300;
        this.gameLayer.addChild(book);
        this.books.push(book);

//        var enemyFighter:fighter.Airplane = fighter.Airplane.produce("f2",1000);
//        enemyFighter.x = Math.random()*(this.stageW-enemyFighter.width);//随机坐标
//        enemyFighter.y = -enemyFighter.height-Math.random()*300;//随机坐标
//        enemyFighter.fire();
//        this.addChildAt(enemyFighter,this.numChildren-1);
//        this.enemyFighters.push(enemyFighter);
    }

    private touchHandler(evt:egret.TouchEvent):void{
        console.log(evt.localX);
        if(evt.type==egret.TouchEvent.TOUCH_MOVE)
        {
            var tx:number = evt.localX;
            tx = Math.max(0,tx);
            tx = Math.min(this.stage.stageWidth,tx);
            this.resLL.x = tx - 75;
//            this.mouth.x = (this.stage.stageWidth - this.mouth.width)/2 ;

            this.mouth.x = tx - 15;
        }
    }

    public static hitTest(obj1:egret.DisplayObject,obj2:egret.DisplayObject):boolean
    {
        var rect1:egret.Rectangle = obj1.getBounds();
        var rect2:egret.Rectangle = obj2.getBounds();

//        var shp1:egret.Shape = new egret.Shape();
//        shp1.graphics.beginFill( 0xff0000, 1);
//        shp1.graphics.drawRect( obj1.x, obj1.y, rect1.width, rect1.height );
//        shp1.graphics.endFill();
//        GameApp.Game.addChild( shp1 );
//
//        var shp2:egret.Shape = new egret.Shape();
//        shp2.graphics.beginFill( 0xff00ff, 1);
//        shp2.graphics.drawRect( obj2.x, obj2.y, rect2.width, rect2.height );
//        shp2.graphics.endFill();
//        GameApp.Game.addChild( shp2 );


        rect1.x = obj1.x;
        rect1.y = obj1.y;

        rect2.x = obj2.x;
        rect2.y = obj2.y;


//        GameApp.Game.removeChild(shp1);
//        GameApp.Game.removeChild(shp2);
        return rect1.intersects(rect2);
    }

    private gameViewUpdate(evt:egret.Event):void{
        try{
            //为了防止FPS下降造成回收慢，生成快，进而导致DRAW数量失控，需要计算一个系数，当FPS下降的时候，让运动速度加快
            var nowTime:number = egret.getTimer();
            var fps:number = 1000/(nowTime-this._lastTime);
            this._lastTime = nowTime;
            var speedOffset:number = 60/fps;

            //每隔10秒速度提高 2
//            var speed:number = 0;
//            if(this.nowTime > 50 && this.nowTime <= 60){
//                speed = 4;
//                this.enemyFightersTimer.delay = 1000;
//            }else if(this.nowTime > 40 && this.nowTime <= 50){
//                speed = 6;
//                this.enemyFightersTimer.delay = 800;
//            }else if(this.nowTime > 30 && this.nowTime <= 40){
//                speed = 8;
//                this.enemyFightersTimer.delay = 600;
//            }else if(this.nowTime > 20 && this.nowTime <= 30){
//                speed = 10;
//                this.enemyFightersTimer.delay = 500;
//            }else if(this.nowTime > 0 && this.nowTime <= 20){
//                speed = 12;
//                this.enemyFightersTimer.delay = 400;
//            }

            var speed = 4+ this.nowTime/10;
            this.enemyFightersTimer.delay = 600;//1000/this.nowTime;

            for(var i:number=0;i<this.books.length;i++){
                this.books[i].y += speed*speedOffset ;
            }

            for(var i:number=0;i<this.books.length;i++){
                if(GameApp.hitTest(this.mouth,this.books[i])){
                    if(this.books[i].name == "soap"){
                        this.gameOver(2);

                        console.log("Game Over");
                    }else{
                        this.gameLayer.removeChild(this.books[i]);
                        this.bookCount++;
                        this.bookCountTextField.text = ""+this.bookCount;
                    }
                };
            }
        }catch(e){

        }

//
//        var theFighter:fighter.Airplane;
//        var enemyFighterCount:number = this.enemyFighters.length;
//        for(i=0;i<enemyFighterCount;i++) {
//            theFighter = this.enemyFighters[i];
//            theFighter.y += 4*speedOffset;
//            if(theFighter.y>this.stageH)
//                delArr.push(theFighter);
//        }
//        for(i=0;i<delArr.length;i++) {//回收不显示的飞机
//            theFighter = delArr[i];
//            this.removeChild(theFighter);
//            fighter.Airplane.reclaim(theFighter,"f2");
//            theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
//            theFighter.stopFire();
//            this.enemyFighters.splice(this.enemyFighters.indexOf(theFighter),1);
//        }
//        delArr = [];

    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
    /**
     * 描述文件加载成功，开始播放动画
     */
    private startAnimation(result:Array<any>):void{
        var textContainer:egret.Sprite = this.textContainer;
        var count:number = -1;
        var self:any = this;
        var change:Function = function() {
            count++;
            if (count >= result.length) {
                count = 0;
            }
            var lineArr = result[count];

            self.changeDescription(textContainer, lineArr);

            var tw = egret.Tween.get(textContainer);
            tw.to({"alpha":1}, 200);
            tw.wait(2000);
            tw.to({"alpha":0}, 200);
            tw.call(change, this);
        }

        change();
    }
    /**
     * 切换描述内容
     */
    private changeDescription(textContainer:egret.Sprite, lineArr:Array<any>):void {
        textContainer.removeChildren();
        var w:number = 0;
        for (var i:number = 0; i < lineArr.length; i++) {
            var info:any = lineArr[i];
            var colorLabel:egret.TextField = new egret.TextField();
            colorLabel.x = w;
            colorLabel.anchorX = colorLabel.anchorY = 0;
            colorLabel.textColor = parseInt(info["textColor"]);
            colorLabel.text = info["text"];
            colorLabel.size = 40;
            textContainer.addChild(colorLabel);

            w += colorLabel.width;
        }
    }
}


