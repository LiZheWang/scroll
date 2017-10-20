(function(){
	
	var tool = {
		isok : function(cb){
			if( !Array.prototype.forEach){
				console.log("你的浏览器太老旧了");
				return false ;
			}
			cb && cb();
		},
		support : function(name,fn){
			if( typeof module == "object" && typeof exports == "object" ){
				module.exports = fn ;
			}else if( typeof define == "function" && define.amd ){
				define(function(){ return fn }) ;
			}else{
				window[name] = fn ;
			}
		},
		addEvent : function(elem,type,fn){elem.addEventListener(type,fn,false);},
		removeEvent : function(elem,type,fn){elem.removeEventListener(type,fn,false);},
		extend : function(s,d){for( var p in d ){s[p] = d[p] ;} return s;} ,
		requestAnimationFrame : function(){ 
			return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame; 
		}(),
		css : function(elem,data){
			var sty ;
			if( typeof data == "string" ){
				elem = elem.length > 1 ? elem[0] : elem ;
				sty = window.getComputedStyle(elem,null) ;
				return sty[data] ? (sty[data].indexOf("px") != -1 ? parseInt(sty[data].replace("px","")) : sty[data]) : ""
			}
			if( typeof data == "object" ){
				if( elem && elem.length > 1 ){
					;Array.prototype.forEach.call(elem,function(item){
						for( var prop in data ){
							item.style[prop] = data[prop] ;
						}
					});
				}else{
					for( var prop in data ){
						if( elem && elem.style ){
							elem.style[prop] = data[prop] ;
						}
					}
				}
			}
		}
	}
	
	tool.isok(scrollInit);
	
	
	function scrollInit(){
		
		var doc = document ;
		var WlzScroll = function(elem,options){
			return this.__init( elem , options || {} );
		}
		
		
		
		
		WlzScroll.prototype = {
			__init : function(elem,options){
				this.elem = typeof elem == "string" ?  document.getElementById(elem) : elem ;
				if( !this.elem ){ console.log("请传入id");  return false;}
				this.ops = tool.extend({
					step : 20 ,
					scroll : null ,
					start : null ,
					end : null
				},options);
				
				//判断是否  mousemove
				this.moveing = false ;
				this.mouseover = false ;
				//判断是否开启滚动条(由系统自动控制)
				this.openScroll = true ;
				//手动启用  禁用 滚动条 (启用和停用功能要用的)
				this.userOpenScroll = true ;
				
				//记录滚动条的位置
				this.scrollTop = null ;
				
				
				this.__createLayou();
				this.update();
				this.__bindEvent();
				
				
				
				
				
				return this ;
			},
			
			__createLayou :function(){
				tool.css(this.elem,{position:"relative",overflow:"hidden"});
				var elemHtml = this.elem.innerHTML ;
				
				var html = 	'<div class="__wlzScroll" id="__wlzScroll">'+elemHtml+'</div>'+
							'<div class="__wlzScroll_bar __wlzScroll_bar_h" id="__wlzScroll_bar_h">'+
								'<div class="__wlzScroll_bar_thumb" id="__wlzScroll_bar_thumb_h"></div>'+
							'</div>'+
							'<div class="__wlzScroll_bar __wlzScroll_bar_v" id="__wlzScroll_bar_v">'+
								'<div class="__wlzScroll_bar_thumb" id="__wlzScroll_bar_thumb_v"></div>'+
							'</div>';
				this.elem.innerHTML = html ;
			},
			
			__getParams : function(){
				this.con = this.elem.querySelector("#__wlzScroll");
				this.barH = this.elem.querySelector("#__wlzScroll_bar_h");
				this.barHB = this.elem.querySelector("#__wlzScroll_bar_thumb_h");
				this.barV = this.elem.querySelector("#__wlzScroll_bar_v");
				this.barVB = this.elem.querySelector("#__wlzScroll_bar_thumb_v");
				this.bars = this.elem.querySelectorAll(".__wlzScroll_bar");
				this.barItems = this.elem.querySelectorAll(".__wlzScroll_bar_thumb");
				this.boxScrollH = this.con.scrollHeight ;
				this.boxScrollW = this.con.scrollWidth ;
				this.boxMaxH = this.elem.offsetHeight ;
				this.boxMaxW = this.elem.offsetWidth ;
				this.distScrollH = this.boxScrollH-this.boxMaxH ;
				this.distScrollW = this.boxScrollW-this.boxMaxW ;
				this.boxMaxH / this.boxScrollH * 100;
				this.heightV = this.boxMaxH / this.boxScrollH * 100;
				this.heightH = this.boxMaxW / this.boxScrollW * 100;
			},
			__ScrollMove : function(step,dir){
				var val = this.getDistance(dir);
				this.__scrollTo(val+step,dir);
			},
			__slideWheelUp : function(dir){this.__ScrollMove(this.ops.step,dir);},
			__slideWheelDown : function(dir){this.__ScrollMove(-this.ops.step,dir);},
			__linear : function(t, b, c, d){return c*t/d + b; },
			__getDuration : function(d){ return Math.ceil(d/17) } ,
			__isH : function(){return this.boxScrollW > this.boxMaxW ;},
			__isV : function(){return this.boxScrollH > this.boxMaxH ;},
			__barsHide:function(){ (!this.moveing && !this.mouseover) && tool.css(this.bars,{opacity:0}); },
			
			__bindEvent : function(){
				var _this = this  ;
				//移入移除控制
				tool.addEvent(this.elem,"mouseover",function(){
					if( !_this.openScroll ){return false} ;
					_this.mouseover = true ;
					tool.css(_this.bars,{opacity:1});
				});
				tool.addEvent(this.elem,"mouseleave",function(){
					if( !_this.openScroll ){return false} ;
					_this.mouseover = false ;
					_this.__barsHide.call(_this) ;
					document.onkeyup = null ;
				});
				//滚轮控制绑定
				var wheelDir ;
				if( navigator.userAgent.indexOf("Firefox") != -1 ){
					tool.addEvent(this.elem,"DOMMouseScroll",function(e){
						if( !_this.openScroll ){return false} ;
						e.preventDefault();
						wheelDir = _this.__isV() ? "v" : 'h' ;
						e.detail > 0 ? _this.__slideWheelDown.call(_this,wheelDir) : _this.__slideWheelUp.call(_this,wheelDir);
					});
				}else{
					tool.addEvent(this.elem,"mousewheel",function(e){
						if( !_this.openScroll ){return false} ;
						e.preventDefault();
						wheelDir = _this.__isV() ? "v" : 'h' ;
						e.wheelDelta < 0 ? _this.__slideWheelDown.call(_this,wheelDir) : _this.__slideWheelUp.call(_this,wheelDir);
					});
				}
				
				if( this.bars && this.bars.length ){
					;Array.prototype.forEach.call(this.bars,function(bar){
						var barThumb = bar.querySelector(".__wlzScroll_bar_thumb") ;
						tool.addEvent(barThumb,"click",function(e){e.stopPropagation() ;});
						//点击进度条的时候  判断是上滚还是下滚，然后滚动
						tool.addEvent(bar,"click",function(e){
							if( !_this.openScroll ){return false} ;
							var top = e.offsetY , left = e.offsetX;
							var thumb = this.querySelector(".__wlzScroll_bar_thumb") ;
							var isWheelDown  , clickDir;
							if( thumb.id == "__wlzScroll_bar_thumb_v" ){
								clickDir = "v" ;
								isWheelDown = top > thumb.offsetTop + thumb.offsetHeight ? true : false ;
							}else{
								clickDir = "h" ;
								isWheelDown = left > thumb.offsetLeft + thumb.offsetWidth ? true : false ;
							}
							isWheelDown ? _this.__slideWheelDown.call(_this,clickDir) :  _this.__slideWheelUp.call(_this,clickDir) ;
						});
						//拖拽滚动条 控制
						bar.onmousedown = function(e){
							if( !_this.openScroll ){return false} ;
							e.preventDefault();
							var sx = e.clientX , sy = e.clientY ;
							var thumb = e.target || e.currentTarget || e.srcElement ;
							var isV = thumb.id == "__wlzScroll_bar_thumb_v" ;
							var offset = isV ? thumb.offsetHeight : thumb.offsetWidth ;
							var mouseDir = isV ? "v" : "h" ;
							var val = _this.getDistance(mouseDir) ;
							
							document.onmousemove = function(e){
								e.preventDefault();
								_this.moveing = true; 
								var mx = e.clientX , my = e.clientY ;
								var distX = mx - sx , distY = my - sy ;
								
								var scale , endval ;
								if( isV ){
									scale = distY / (_this.boxMaxH-offset)  ;
									endval = ( (_this.boxScrollH - _this.boxMaxH ) * scale ) - val;
								}else{
									scale = distX / (_this.boxMaxW-offset)  ;
									endval = ( (_this.boxScrollW - _this.boxMaxW ) * scale ) - val;
								}
								
								_this.__scrollTo(-endval,mouseDir);
							}
							
							document.onmouseup = function(){
								_this.moveing = false;
								document.onmousemove = null ;
								document.onmouseup = null ;
								_this.__barsHide.call(_this) ;
							}
						}
					});
				}
			},
			__scrollTo : function(endval,direction){
				if( endval == undefined ) return false ;
				var _this = this , proportion , bar , type , dir , max;
				var styleCss = {} , styleBar = {};
				var fns = {
					move : function(dr){
						this.cb(dr);
						styleCss[dir] = endval + "px" ;
						tool.css(_this.con,styleCss);
						styleBar[type] = proportion + "%" ;
						tool.css(bar,styleBar) ;
					},
					h : function(){
						type = "left" ;
						dir = "marginLeft" ;max = _this.distScrollW ;bar = _this.barHB ;
						endval = endval >= 0 ? 0 : Math.abs(endval) > _this.distScrollW ? -_this.distScrollW : endval ;
						proportion = ( Math.abs(endval) + _this.boxMaxW ) / _this.boxScrollW * 100 - _this.heightH;
						this.move("h");
					},
					v:function(){
						type = "top" ;
						dir = "marginTop" ; max = _this.distScrollH ;bar = _this.barVB ;
						endval = endval >= 0 ? 0 : Math.abs(endval) > _this.distScrollH ? - _this.distScrollH : endval ;
						proportion = ( Math.abs(endval) + _this.boxMaxH ) / _this.boxScrollH * 100 - _this.heightV;
						this.move("v");
					},
					cb : function(dr){
						//处理回调
						var top = Math.ceil(Math.abs(endval)) ;
						if( top != _this.scrollTop ){
							if( top == 0 && typeof _this.ops.start == "function" ){
								_this.ops.start(dr);
							}else if ( top >= max && typeof _this.ops.end == "function" ){
								_this.ops.end(dr);
							}else{
								if( typeof _this.ops.scroll == "function" ){
									_this.ops.scroll(top,dr);
								}
							}
						}
						_this.scrollTop = top ;
					}
				}
				if( direction  ){
					if( direction == "v" ){fns.v();}
					if( direction == "h" ){fns.h();}
				}else{
					if( this.__isV() ){fns.v();}else {fns.h();}
				}
				
				fns = null ;
				
			},
			//滚动到指定的位置
			scrollTo : function(endval,direction){
				var val = this.getDistance(direction);
				if(  typeof endval == "number" ){
					endval = Math.abs(val) >= endval ? val-(val+endval) : val - (endval+val) ;
					this.__scrollTo(endval,direction);
				}else{
					//如果滚动条不显示了  就把相应margin去除掉
					var valV = this.getDistance("v");
					var valH = this.getDistance("h");
					if( !this.__isV() ){
						this.__scrollTo(0,"v");
					}else if( !this.__isH() ){
						this.__scrollTo(0,"h");
					}
				}
				
			},
			//移动到最顶层
			scrollToStart : function(direction){this.scrollTo(0,direction);},
			//移动到最底层
			scrollToEnd : function(direction){
				this.scrollTo( this.__isV() ? this.distScrollH : this.distScrollW,direction);
			},
			//获取scroll容器
			getScroll : function(){return this.con ;},
			//获取距离
			getDistance : function(direction){
				var dir ;
				if( direction ){
					dir = direction == "v" ? "marginTop" : 'marginLeft' ;
				}else{
					dir = this.__isV() ? "marginTop" : 'marginLeft' ;
				}
				return tool.css(this.con,dir); ;
			},
			//更新this.elem的滚动条
			update : function(){
				this.__getParams();
				if( !this.userOpenScroll ) return false ;
				if( this.openScroll ){
					if( !this.__isV() && !this.__isH() ){
						this.disabled(true);
					}else{
						if( this.__isV() ){
							tool.css(this.barVB,{height : this.heightV + "%",display:"block"});
						}else{
							tool.css(this.barVB,{display : "none"}) ;
						}
						if( this.__isH() ){
							tool.css(this.barHB,{width : this.heightH + "%",display:"block"}) ;
						}else{
							tool.css(this.barHB,{display : "none"}) ;
						}
					}
					this.scrollTo();
				}else{
					if( this.userOpenScroll ){
						if( this.__isV() || this.__isH() ){this.enabled(true) ;}
					}
				}
			},
			//还原到滚动条
			restore : function(){
				this.scrollToStart("v");
				this.scrollToStart("h");
				this.update();
			},
			//type为true  不设置 userOpenScroll  ， 否则就设置userOpenScroll
			enabled : function(type){
				this.openScroll = true ;
				if( type != true ) this.userOpenScroll = true ;
				tool.css(this.bars,{display:"block"});
				this.update();
			},
			disabled : function(type){
				this.openScroll = false;
				if( type != true ) this.userOpenScroll = false ;
				tool.css(this.barVB,{height : 0 + "%"}) ;
				tool.css(this.barHB,{width : 0 + "%"}) ;
				tool.css(this.bars,{display:"none"});
				this.update();
			}
		}
		
		
		
		
		
		
		
		
		
		
		
		tool.support("WlzScroll",WlzScroll) ;
	}
	
})();
