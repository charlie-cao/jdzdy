/**
 * Created by caolei on 14-8-5.
 */
//老罗命名空间
module LaoLuo{
    /**
     * 游戏主容器
     */
    export class GameContainer extends egret.DisplayObjectContainer
    {
        public constructor(){
            super();
            this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        }

        private onAddToStage(event:egret.Event){
            this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
            this.createGameScene();
        }

        private createGameScene():void{}
    }
}