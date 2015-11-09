define("app/score/models/score",[],function(){return function(){return{points:0}}}),define("app/ingame/models/ball",[],function(){function Ball(){var ball,createShape=function(){ball=new Shape.Circle(new Point(80,50),10),ball.strokeColor="black"},myBall={getShape:function(){return ball},speed:5,direction:{x:0,y:1},load:function(){createShape()},start:function(){ball.onFrame=function(){ball.translate(new Point(myBall.direction.x*myBall.speed,myBall.direction.y*myBall.speed))}},stop:function(){ball.onFrame=function(){}},destroy:function(){ball.remove()}};return myBall}return Ball}),define("app/ingame/models/board",[],function(){function Board(){var shape,tool=new paper.Tool,registerEvents=function(){tool.onMouseMove=function(event){shape.position.x=event.point.x}},deRegisterEvents=function(){tool.onMouseMove=function(){}},createShape=function(){var topLeft=new paper.Point(0,paper.view.size.height-20),rectSize=new paper.Size(60,10),rect=new paper.Rectangle(topLeft,rectSize);shape=new paper.Shape.Rectangle(rect),shape.fillColor="green"};return{getShape:function(){return shape},load:function(){createShape(),registerEvents()},stop:function(){deRegisterEvents()},start:function(){registerEvents()},destroy:function(){shape.remove()},type:"pad",handleHit:function(){}}}return Board}),define("app/ingame/models/brick",[],function(){function brick(brickData){var shape,createShape=function(){var topLeft=new paper.Point(brickData.x,brickData.y),rectSize=new paper.Size(50,20),rect=new paper.Rectangle(topLeft,rectSize);shape=new paper.Shape.Rectangle(rect),shape.fillColor=brickData.color};return{create:function(){createShape()},getShape:function(){return shape},handleHit:function(){this.destroy()},destroy:function(){shape.remove()},type:"brick",points:brickData.points}}return brick}),define("app/ingame/models/level",[],function(){function level(levelData){return{objects:levelData,create:function(){for(var i=0;i<this.objects.length;i++)this.objects[i].create()},destroy:function(){for(var i=0;i<this.objects.length;i++)this.objects[i].destroy()}}}return level}),define("app/event/eventListener",[],function(){var EventListener=function(){return{handlers:{},handleEvent:function(name,callbackObject){"undefined"!=typeof this.handlers[name]&&this.handlers[name](callbackObject)}}};return EventListener}),define("app/ingame/level/levelEventHandler",["app/event/eventListener"],function(EventListener){var LevelEventListener=function(levelService){var listener=EventListener();return listener.handlers.HIT=function(eventData){"brick"===eventData.collisionObject.type&&(levelService.remove(eventData.collisionObject),eventData.collisionObject.handleHit())},listener};return LevelEventListener}),define("app/ingame/level/levelService",["app/ingame/models/brick","app/ingame/models/level","app/ingame/level/levelEventHandler"],function(brick,level,LevelEventHandler){function LevelService(objects,eventManager){function loadLevel(){currentLevel=levels[index],currentLevel.create();for(var i=0;i<currentLevel.objects.length;i++)objects.push(currentLevel.objects[i]),currentBricks.push(currentLevel.objects[i])}var currentLevel,levels=[],index=0,currentBricks=[],level1=[brick({x:10,y:10,color:"green",points:10}),brick({x:100,y:10,color:"red",points:20})],level2=[brick({x:150,y:10,color:"green",points:10}),brick({x:250,y:30,color:"red",points:20})];levels.push(level(level1)),levels.push(level(level2));var levelService={loadLevel:function(idx){index=idx,loadLevel()},loadNextLevel:function(){index++,loadLevel()},getBricks:function(){return currentBricks},destroy:function(){currentLevel.destroy()},isLastLevel:function(){return index===levels.length-1},remove:function(object){currentBricks=_.without(currentBricks,object);var index=objects.indexOf(object);index>-1&&objects.splice(index,1),0===currentBricks.length&&eventManager.event("LEVEL_COMPLETED")}};return eventManager.registerListener(LevelEventHandler(levelService)),levelService}return LevelService}),define("app/event/eventManager",[],function(){var EventManager=function(parent){var listeners=[];return{event:function(name,callbackObject){for(var i=0;i<listeners.length;i++)listeners[i].handleEvent(name,callbackObject);"undefined"!=typeof parent&&parent.event(name,callbackObject)},registerListener:function(listener){listeners.push(listener)},removeListener:function(listener){}}};return EventManager}),define("app/ingame/collision/service/collisionDetector",[],function(){function CollisionDetector(){function distanceSquared(x1,y1,x2,y2){var deltaX=x2-x1,deltaY=y2-y1;return deltaX*deltaX+deltaY*deltaY}return{checkCollision:function(ball,rect){var cX,verticalHit=!1;return ball.position.x<rect.bounds.left?cX=rect.bounds.left:ball.position.x>rect.bounds.left+rect.size.width?cX=rect.bounds.left+rect.size.width:(cX=ball.position.x,verticalHit=!0),ball.position.y<rect.bounds.top?cY=rect.bounds.top:ball.position.y>rect.bounds.top+rect.size.height?cY=rect.bounds.top+rect.size.height:cY=ball.position.y,distanceSquared(ball.position.x,ball.position.y,cX,cY)<ball.radius*ball.radius?{collided:!0,verticalHit:verticalHit}:{collided:!1}}}}return CollisionDetector}),define("app/ingame/collision/collisionService",["app/ingame/collision/service/collisionDetector"],function(CollisionDetector){var CollisionService=function(objects,ball,eventManager){function checkObjectCollision(){for(var i=0;i<objects.length;i++){var result=collisionDetector.checkCollision(ball.getShape(),objects[i].getShape());result.collided&&eventManager.event("HIT",{collisionObject:objects[i],collisionInfo:{verticalHit:result.verticalHit}})}}function checkWallCollision(){ball.getShape().position.y<0&&eventManager.event("WALL_HIT",{collisionInfo:{verticalHit:!0,side:"top"}}),(ball.getShape().position.x<0||ball.getShape().position.x>view.viewSize.width)&&eventManager.event("WALL_HIT",{collisionInfo:{verticalHit:!1}}),ball.getShape().position.y>view.viewSize.height&&eventManager.event("WALL_HIT",{collisionInfo:{verticalHit:!0,side:"bottom"}})}var collisionDetector=CollisionDetector();return{checkForCollisions:function(){checkWallCollision(),checkObjectCollision()}}};return CollisionService}),define("app/ingame/collision/service/ballDirectionService",[],function(){function BallDirectionService(ball){return{calculate:function(pad){var winkel=1.5*(ball.getShape().position.x-pad.position.x);winkel*=Math.PI/180;var left=Math.sin(winkel),top=Math.cos(winkel);return{x:left,y:-1*top}}}}return BallDirectionService}),define("app/ingame/collision/collisionHandler",["app/event/eventListener","app/ingame/collision/service/ballDirectionService"],function(EventListener,BallDirectionService){var CollisionHandler=function(ball){function changeBallDirection(collisionInfo){collisionInfo.verticalHit?ball.direction.y=-1*ball.direction.y:ball.direction.x=-1*ball.direction.x}var ballDirectionService=BallDirectionService(ball),listener=EventListener();return listener.handlers.HIT=function(eventData){changeBallDirection(eventData.collisionInfo),"pad"===eventData.collisionObject.type&&(ball.direction=ballDirectionService.calculate(eventData.collisionObject.getShape()))},listener.handlers.WALL_HIT=function(eventData){changeBallDirection(eventData.collisionInfo)},listener};return CollisionHandler}),define("app/ingame/ingameHandler",["app/ingame/models/ball","app/ingame/models/board","app/ingame/level/levelService","app/event/eventManager","app/ingame/collision/collisionService","app/ingame/collision/collisionHandler"],function(Ball,Board,LevelService,EventManager,CollisionService,CollisionHandler){var IngameHandler=function(parentEventManager){var pause=!1,ball=Ball(),gameObjects=[],board=Board(),eventManager=EventManager(parentEventManager),levelService=LevelService(gameObjects,eventManager),collisionService=CollisionService(gameObjects,ball,eventManager);eventManager.registerListener(CollisionHandler(ball)),gameObjects.push(board);var ingameHandler={init:function(){paper.install(window),paper.setup(document.getElementById("myCanvas"))},start:function(levelNumber){levelService.loadLevel(levelNumber),board.load(),ball.load(),ball.start(),paper.view.onFrame=function(){collisionService.checkForCollisions()}},stop:function(){ball.destroy(),board.destroy(),levelService.destroy(),paper.view.onFrame=function(){},keyEventHandler.deRegisterEvents()},pause:function(){console.log("pause!"),pause?(ball.start(),board.start()):(ball.stop(),board.stop()),pause=!pause}};return ingameHandler};return IngameHandler}),define("app/story/storyEventHandler",["app/event/eventListener"],function(EventListener){var StoryEventHandler=function(storyService){var listener=EventListener();return listener.handlers.SKIP=function(){},listener.FULL_SKIP=function(){storyService.end()},listener};return StoryEventHandler}),define("app/story/storyService",["app/event/eventManager","app/story/storyEventHandler"],function(EventManager,StoryEventHandler){var StoryService=function(parentEventManager){var storyEventManager=EventManager(parentEventManager),storyService={start:function(number){storyService.end()},end:function(){storyEventManager.event("STORY_END")}};return storyEventManager.registerListener(StoryEventHandler(storyService)),storyService};return StoryService}),define("app/campaign/campaignEventHandler",["app/event/eventListener"],function(EventListener){var StoryEventHandler=function(campaignService){var listener=EventListener();listener.handlers.STORY_END=function(){campaignService.next()}};return StoryEventHandler}),define("app/campaign/campaignService",["app/score/models/score","app/ingame/ingameHandler","app/story/storyService","app/event/eventManager","app/campaign/campaignEventHandler"],function(Score,IngameHandler,StoryService,EventManager,CampaignEventHandler){var CampaignService=function(){function load(){var currentState=story[current];"LEVEL"===currentState.type&&ingameHandler.start(currentState.number),"STORY"===currentState.type&&storyService.start()}var current=0,campaignEventManager=(Score(),EventManager()),ingameHandler=IngameHandler(campaignEventManager),storyService=StoryService(campaignEventManager),story=[{name:"Prolog",type:"STORY"},{name:"Level1",type:"LEVEL",number:1}],campaignService={start:function(){current=0,ingameHandler.init(),load()},next:function(){current++,current==story.length?(ingameHandler.stop(),gameEventHandler.win()):load()}};return campaignEventManager.registerListener(CampaignEventHandler(campaignService)),campaignService};return CampaignService}),define("app/gui/gameController",[],function(){function gameCtrl($scope,gameService){$scope.score={},$scope.score.points=2,$scope.start=function(){gameService.game.start()},$scope.keyPressed=function(keyNum){}}return gameCtrl.$inject=["$scope","gameService"],gameCtrl}),define("app/gui/UIService",["app/gui/gameController"],function(gameController){function UIService(game){angular.module("breakoutApp",[]).factory("$exceptionHandler",function(){return function(exception,cause){throw exception.message+=' (caused by "'+cause+'")',exception}}).service("gameService",function(){return{game:game}}).controller("gameCtrl",gameController),angular.bootstrap(document,["breakoutApp"])}return UIService}),define("app/game",["require","app/campaign/campaignService","app/gui/UIService"],function(require){var CampaignHandler=require("app/campaign/campaignService"),UIService=require("app/gui/UIService"),game={isPaused:pause,start:function(){campaignHandler.start()},stop:function(){}},pause=!1,campaignHandler=(UIService(game),CampaignHandler());game.notifyChange=function(){}});