;(function () {
	
	/**
	 * The module for native-like page transition between the pages of a multi-page web app
	 * 
	 */
	
	/**
	 * The first part load and manage the pages of the app
	 * The second part handle the touch events
	 */
	
	function pageTransition(selector, options) {

		options = options || {}

		/**
		 * The selector which indicate the element be binded the touch events
		 * @type {String}
		 */
		this.selector = options.selector || "body"

		/**
		 * an empty module for the page // now based on the jquery mobile
		 * @type {Element}
		 */
		this.initPage = $("#init").clone(true)
		$("#init").remove()
		// console.log("init remove called")

		/**
		 * a stack of the loaded pages
		 * @type {Array}
		 */
		this.pageStack = []

		/**
		 * a trash for the element which has been returned
		 * @type {Array}
		 */
		this.pageTrash = []

		/**
		 * The width of left area which can trigger back transition
		 * @type {Number}
		 */
		this.leftActive = options.leftActive || 30

		/**
		 * The background color of the transition
		 * @type {String}
		 */
		this.backgroundColor = options.backgroundColor || "black"

		/**
		 * The initial scale for the previous page
		 * @type {Number}
		 */
		this.initScale = options.initScale || 0.92

		/**
		 * The initial shift on the x direction
		 * @type {[type]}
		 */
		this.initShift = options.initShift || -0.3

		/**
		 * The initial opacity for the previous page
		 * @type {Number}
		 */
		this.initOpac = options.initOpac || 0.5

		/**
		 * Once the swipe width over the backActive region of the whole width, back event is triggered
		 * @type {Number}
		 */
		this.backActive = options.backActive || 0.3

		/**
		 * The millisecond time of the page transition on a back event
		 * @type {Number}
		 */
		this.transitionTime = options.transitionTime || 200

		/**
		 * The damping of the smooth scroll
		 * @type {Number}
		 */
		this.scrollDamping = options.scrollDamping || 8

		/**
		 * Call the loadPage function to load the target file
		 * @param  {Number} window.location.hash.length The length of specific hash tag. When it's zero, load the default page
		 * @return {[type]}                             [description]
		 */
		if (window.location.hash.length == 0) {
			this.loadPage()
		} else {
			this.loadPage(window.location.hash.slice(1))
		}
	
		return this
	}	

	/**
	 * function to get the element's id of the previous page
	 * @author Yaliang
	 * @anotherdate 2015-08-17T21:44:04+0800
	 * @return      {String}                 The id of previous page
	 */
	pageTransition.prototype.prevPage = function() {
		if (this.pageStack.length < 2) {
			return undefined
		} else {
			return this.pageStack[this.pageStack.length - 2]
		}
	}

	/**
	 * function to get the element's id of current page
	 * @author Yaliang
	 * @anotherdate 2015-08-17T20:45:22+0800
	 * @return      {String}                 The id of the current page
	 */
	pageTransition.prototype.nowPage = function() {
		if (this.pageStack.length == 0) {
			return undefined
		} else {
			return this.pageStack[this.pageStack.length - 1]
		}
	}

	/**
	 * function to pop current page from the page stack
	 * @author Yaliang
	 * @anotherdate 2015-08-17T20:47:00+0800
	 * @return      {String}                 The id of the current page
	 */
	pageTransition.prototype.popPage = function() {
		return this.pageStack.pop()
	}

	/**
	 * create the element of the next page and append to "body"
	 * @author Yaliang
	 * @anotherdate 2015-08-17T20:47:45+0800
	 * @param       {Object}                 obj The page definition
	 * @return      {Element}                    The element of new appended page
	 */
	pageTransition.prototype.createPage = function(obj) {

		/**
		 * obj is an extracted object to specific the content and setup of the new page
		 *
		 * obj.pageId: the id of the page
		 * obj.pageUrl: the url of the page
		 * obj.header: the header of the page
		 * obj.content: the main content of the page
		 * obj.footer: the footer of the page
		 * 
		 */

		/**
		 * The element which fulfilled with the new page's contents
		 * @type {Element}
		 */
		var newPage = this.initPage.clone(true)
		newPage.attr("id", obj.pageId)
		newPage.attr("data-url", obj.pageUrl)
		newPage.children(".ctrl-page-header").attr("id",obj.pageId+"-header").html(obj.header)
		newPage.children(".ctrl-page-content").attr("id",obj.pageId+"-content").html(obj.content)
		newPage.children(".ctrl-page-footer").attr("id",obj.pageId+"-footer").html(obj.footer)

		/** add attribution for content part*/
		var contentAttr = obj.contentAttr || {}

		var contentAttrOverScroll = contentAttr.overscroll || false
		if (contentAttrOverScroll) {
			newPage.children(".ctrl-page-content").attr("data-overscroll", "true")
		}

		$("body").append(newPage)

		newPage.find("a").bind("click", this, function(event) {
			if ($(this).attr("data-nav") == "back") {
				// event.data.backPage()
			} else {
				var href = $(this).attr("data-href")
				event.data.loadPage(href)
			}
		})

		$(document).on("pageshow", "#"+obj.pageId, this, function(event) {
			/**
			 * Set the touch Events, this functionality might be able to move into load page function
			 */

			event.data.initTouch({
				prevPage: "#" + event.data.prevPage(),
				nowPage: "#" + event.data.nowPage(),
				backFunction: event.data.backPage
			})

			$(this).css("overflowY","hidden")

			/**
			 * Set the outerHeight of content element
			 */
			
			var window_height = $(window).height()
			var head_height = $(this).children(".ctrl-page-header").outerHeight()
			var foot_height = $(this).children(".ctrl-page-footer").outerHeight()

			$(this).children(".ctrl-page-content").outerHeight(window_height - head_height - foot_height).css("overflowY", "scroll")
			$(this).children(".ctrl-page-content").css({
				"position":"relative",
				"top": "0px"
			})
			if ( !$(this).children(".ctrl-page-content").prev().hasClass("touch-scroll-bar") ) {
				$(this).children(".ctrl-page-content").before("<div class='touch-scroll-bar'></div>")
			}


		})

		return newPage

	}

	/**
	 * The function to call a AJAX get and record the pages
	 * @author Yaliang
	 * @anotherdate 2015-08-17T21:09:26+0800
	 * @param       {String}                 id The identification for the page need to be loaded
	 * @return      {Element}                   The loaded page
	 */
	pageTransition.prototype.loadPage = function(id) {

		var obj = fackget.get(id)

		this.pageStack.push(obj.pageId)


		if ($("#"+id).length == 0) {
			var newPage = this.createPage(obj)
		}

		$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+obj.pageId, {
			transition: "none",
		} );


		return newPage
	}

	/**
	 * The function which need to be called when a back function triggered
	 * @author Yaliang
	 * @anotherdate 2015-08-17T21:11:34+0800
	 * @return      {[type]}                 [description]
	 */
	pageTransition.prototype.backPage = function() {

		/** maintain the pageStack */
		this.popPage()

		/**
		 * manually change the active page class.
		 * The purpose of this operation is to avoid the flicker happened at the moment 
		 * when the page pop back to the previous page
		 */
		this.nowElement.removeClass("ui-page-active")
		this.prevElement.addClass("ui-page-active")

		/** pop a history state of the previous page */
		window.history.back()

		/**
		 * remove the element, when the page set need to removed when it is pop from history stack
		 * or request a force reload when it's reappeared
		 */
		if (this.nowElement.attr("data-remove") == "forever" || this.nowElement.attr("data-reload") == "true") {
			this.pageTrash.push(this.nowElement)
			this.nowElement.remove()
		}

	}

	/**
	 * The function to unbind the x-controller
	 * @return {[type]} [description]
	 */
	pageTransition.prototype.touchXcontrollerStop = function() {
		/** stop the animation */
		this.touchAnimateStop()

		/** unbind the touch listener when $(this.selector) exists*/
		if (typeof this.selector != "undefined" && $(this.selector).length > 0) {
			$(this.selector).unbind("touchstart").unbind("touchmove").unbind("touchend")
		}
	}

	/**
	 * The function to stop the animation applied on the current and previous elements
	 * @return {[type]} [description]
	 */
	pageTransition.prototype.touchAnimateStop = function() {
		if (typeof this.nowElement != "undefined" && this.nowElement.length > 0) {
			this.nowElement.stop()
			this.nowElement.css("left","")
			this.nowElement.css("width","")
		}

		if (typeof this.prevElement != "undefined" && this.prevElement.length > 0) {
			this.prevElement.stop()
			this.prevElement.css("transform", "").css("-webkit-transform", "").css("-moz-transform", "")
			this.prevElement.attr("data-scale","")
			this.prevElement.css("opacity", "")
			this.prevElement.css("display", "")
		}
	}

	/**
	 * The event handler which handle the touch start.
	 * @param  {Object} event The event object of the touch event
	 * @return {[type]}       [description]
	 */
	pageTransition.prototype.touchXcontrollerStartEvent = function(event) {
		// if (typeof this.xblock != "undefined" && this.xblock == true) {
		// 	return
		// }
		// console.log(event)
		this.startX = event.originalEvent.changedTouches[0].clientX
		this.currentX = this.startX
		// this.xblock = true
		this.nowFinger = event.originalEvent.changedTouches[0].identifier

	}

	/**
	 * The event handler which handle the touch move
	 * @param  {Object} event The event object of the touch event
	 * @return {[type]}       [description]
	 */
	pageTransition.prototype.touchXcontrollerMoveEvent = function(event) {
		// if (parseInt(event.originalEvent.changedTouches[0].identifier) != parseInt(this.nowFinger)) {
		// 	return 
		// }

		this.currentX = event.originalEvent.changedTouches[0].clientX

		/** if the touch start point is in the left active area, then the animation of transition is updated. Otherwise, stop the animation */
		if (this.startX < this.leftActive && this.prevElement.length > 0) {
			/** set the previous element visible */
			this.prevElement.css("display", "block")

			/** set the transition background */
			$(this.selector).css("background-color",this.backgroundColor)

			/** set the transition animation*/
			var distance = this.currentX - this.startX
			var fullwidth = $(window).width()
			this.nowElement.children(".ui-content").outerWidth(fullwidth)
			this.nowElement.css("left", Math.max(distance, 0).toString()+"px")
			this.nowElement.css("width", (fullwidth - Math.max(distance, 0)).toString()+"px")

			var prevElementScale = this.initScale + (1.0 - this.initScale)*(1.0*this.currentX / fullwidth)
			var scaleString = "scale("+prevElementScale.toString()+","+prevElementScale.toString()+")"
			this.prevElement.css("transform", scaleString).css("-webkit-transform", scaleString).css("-moz-transform", scaleString)
			this.prevElement.attr("data-scale", prevElementScale.toString())

			var prevElementShift = (this.initShift + (0 - this.initShift)*(1.0*this.currentX / fullwidth))*fullwidth
			this.prevElement.css("left", Math.round(prevElementShift).toString() + "px")

			var prevElementOpac = this.initOpac + (1.0 - this.initOpac)*(1.0*this.currentX / fullwidth)
			this.prevElement.css("opacity", prevElementOpac.toString())

		} else {
			this.touchAnimateStop()
		}
	}

	/**
	 * The event handler which handle the touch end
	 * @param  {Object} event The event object of the touch event
	 * @return {[type]}       [description]
	 */
	pageTransition.prototype.touchXcontrollerEndEvent = function(event) {
		// if (parseInt(event.originalEvent.changedTouches[0].identifier) != parseInt(this.nowFinger)) {
		// 	return 
		// }

		if ((( typeof $(event.target).attr("data-nav") != "undefined" && $(event.target).attr("data-nav").toLowerCase() == "back") || this.startX < this.leftActive) && this.prevElement.length > 0) {
			var distance = this.currentX - this.startX
			var fullwidth = $(window).width()
			/** set the previous element visible */
			this.prevElement.css("display", "block")

			/** set the transition background */
			$(this.selector).css("background-color",this.backgroundColor)

			/** initialize the current element's width */
			// this.nowElement.children(".ui-content").css("width","")
			// this.nowElement.css("width", "")

			if (( typeof $(event.target).attr("data-nav") != "undefined") && ($(event.target).attr("data-nav").toString().toLowerCase() == "back") || distance > this.backActive * fullwidth) {
				/** The touch move distance is over the backActive region, which means page needs to pop back */

				/** start the jquery-based animation for transition between pages */
				this.prevElement.animate({
					"opacity": "1",
					"left": "0"
				}, {
					duration: this.transitionTime,
					progress: function(animate, now, remain) {
						var initScale = parseFloat($(this).attr("data-scale"))
						var nowScale = initScale + (1.0 - initScale)*(1.0*now) 
						var nowScaleStr = "scale("+nowScale.toString()+","+nowScale.toString()+")"
						$(this).css("transform",nowScaleStr).css("-webkit-transform",nowScaleStr).css("-moz-transform", nowScaleStr)
					}
				})

				this.nowElement.bind("transition-done", this, function(event) {
					event.data.touchAnimateStop()
					event.data.backPage()
					$(this).unbind("transition-done")
				})

				this.nowElement.animate({
					"left": fullwidth,
					"width": "0"
				}, {
					duration: this.transitionTime,
					complete: function() {
						$(this).trigger("transition-done")
					}
				})

			} else {
				/** The touch move distance is under the backActive region, which means keeping stay in current page */
				this.nowElement.bind("transition-cancel", this, function(event) {
					event.data.touchAnimateStop()
					$(this).unbind("transition-cancel")
				})

				/** start the jquery-based animation for transition of cancel page back */
				this.prevElement.animate({
					"opacity": this.initOpac.toString()
				}, {
					duration: this.transitionTime,
					progress: function(animate, now, remain) {
						var initScale = parseFloat($(this).attr("data-scale"))
						var nowScale = initScale + (pageTransition.initScale - initScale)*(1.0*now) 
						var nowScaleStr = "scale("+nowScale.toString()+","+nowScale.toString()+")"
						$(this).css("transform",nowScaleStr).css("-webkit-transform",nowScaleStr).css("-moz-transform", nowScaleStr)
					}
				})

				this.nowElement.animate({
					"left": "0",
					"width": fullwidth
				}, {
					duration: this.transitionTime,
					complete: function() {
						$(this).trigger("transition-cancel")
					}
				})
			}
		} else {
			this.touchAnimateStop()
		}

		this.xblock = false
	}

	pageTransition.prototype.touchUpdateScrollBar =  function() {
		if (this.scrollElement.prev().hasClass("touch-scroll-bar")) {
			var scrollHeight = this.scrollElement[0].scrollHeight
			var clippedHeight = this.scrollElement.outerHeight()
			var scrollTop = this.scrollElement.scrollTop()
			var offsetTop = this.scrollElement.offset().top + Math.round(1.0*scrollTop/scrollHeight * clippedHeight) - parseFloat(this.scrollElement.css("top"))
			var barHeight = Math.max(10,Math.round(1.0*clippedHeight*clippedHeight/scrollHeight * clippedHeight/(parseFloat(this.scrollElement.css("top"))*5+clippedHeight)))
			this.scrollElement.prev().height(barHeight)
			this.scrollElement.prev().offset({top: offsetTop, right: 10})
		}
	}

	pageTransition.prototype.touchShowScrollBar = function() {
		if (this.scrollElement.prev().hasClass("touch-scroll-bar")) {
			var scrollHeight = this.scrollElement[0].scrollHeight
			var clippedHeight = this.scrollElement.outerHeight()
			if (scrollHeight > clippedHeight) {
				this.scrollElement.prev().stop()
				this.scrollElement.prev().css("opacity","")
				this.scrollElement.prev().show()
			}
		}
	}

	pageTransition.prototype.touchHideScrollBar = function() {
		if (this.scrollElement.prev().hasClass("touch-scroll-bar")) {
			this.scrollElement.prev().stop()
			this.scrollElement.prev().fadeOut()
		}
	}

	pageTransition.prototype.touchYcontrollerStartEvent = function(event) {
		/** find the closest scroll-over y */
		var closestBlocker = $(event.originalEvent.target)
		while (closestBlocker[0].parentElement != null && closestBlocker.length > 0 && closestBlocker.css("overflowY") != "scroll") {
			closestBlocker = closestBlocker.parent()
		}

		/** set up the scroll functionality */
		if (closestBlocker[0].parentElement == null && closestBlocker.css("overflowY") != "scroll") {
			/** ignore the scroll event */
			this.scrollElement = null
		} else {
			window.clearInterval(this.smoothScrollInterval)
			this.scrollElement = closestBlocker
			this.scrollElementTop = this.scrollElement.scrollTop()
			this.startY = event.originalEvent.touches[0].clientY
			this.startYTime = event.timeStamp
			this.lastY = this.startY
			this.lastYTime = this.startYTime
			this.currentY = this.startY
			this.currentYTime = event.timeStamp
			this.lastRawSpeedY = 0
			this.rawSpeedY = 0
			this.moveRateY = 0
			this.slowMoveEventsTimeY = 100
			this.touchUpdateScrollBar()
			this.touchShowScrollBar()
		}
	}

	pageTransition.prototype.touchYcontrollerMoveEvent = function(event) {
		if (this.scrollElement != null) {
			this.lastY = this.currentY
			this.lastYTime = this.currentYTime
			this.currentY = event.originalEvent.touches[0].clientY
			this.currentYTime = event.timeStamp
			this.moveRateY = (1+Math.round(Math.abs(this.currentY - this.lastY) / 10))
			this.lastRawSpeedY = this.rawSpeedY
			this.rawSpeedY = 1.0 * (this.currentY - this.lastY) / (this.currentYTime - this.lastYTime) * 1000 // px/s
			if (this.moveRateY > 1) {
				this.slowMoveEventsTimeY = 0
			} else {
				this.slowMoveEventsTimeY += 1
			}
			var newTop = this.scrollElementTop - (this.currentY - this.lastY)
			this.scrollElement.scrollTop(Math.round(newTop))
			this.scrollElementTop = newTop
			if ( this.scrollElement.scrollTop() == 0 && this.scrollElement.attr("data-overscroll") == "true") {
				/** handle over scroll */
				var currentTop = parseFloat(this.scrollElement.css("top"))
				var currentHeight = this.scrollElement.outerHeight()
				var currentTopRate = 1.0* currentTop / currentHeight
				var topYdelta = 1.0*(this.currentY - this.lastY)/(1.0+25.0*currentTopRate)
				var newTopY = topYdelta+currentTop
				this.scrollElement.css("top",(newTopY).toString()+"px")
			} else {
				/** search the up level scroll element */
			}
			this.touchUpdateScrollBar()
			this.touchShowScrollBar()


		}
	}

	pageTransition.prototype.touchYcontrollerEndEvent = function(event) {
		if (this.scrollElement != null) {

			/** bind the events for smooth scroll */
			this.scrollElement.bind("smooth-scroll-done", this, function(event) {
				event.data.touchHideScrollBar()
				event.data.scrollElement.unbind("smooth-scroll-done")
			})

			/** bind the event to handle the over scroll animation */
			this.scrollElement.bind("over-scroll-recovery", this, function(event) {
				if (typeof event.data.smoothScrollInterval != "undefined") {
					window.clearInterval(event.data.smoothScrollInterval)
				}
				event.data.scrollElement.animate({
					"top":"0"
				}, {
					duration: 150,
					complete: function() {
						$(this).unbind("over-scroll-recovery")
						$(this).trigger("smooth-scroll-done")
					}
				})
			})

			/** handle smooth scroll */
			if (this.slowMoveEventsTimeY <= 1) {
				/** use the greater speed in current two events */
				if (Math.abs(this.lastRawSpeedY) > Math.abs(this.rawSpeedY))
					this.rawSpeedY = this.lastRawSpeedY


			

				/** set the interval to update the smooth scroll */
				this.smoothScrollInterval = setInterval(function(a) {
					/** use damping model to build a smooth scroll animation */
					var deltatime = 3.0/1000
					var initSpeed = 1.0*a.rawSpeedY
					var endSpeed = initSpeed - 0.5*a.scrollDamping*initSpeed*deltatime
					var avgSpeed = (initSpeed + endSpeed) / 2.0
					var deltaTop = avgSpeed * deltatime
					var newTop = a.scrollElementTop - deltaTop
					a.scrollElement.scrollTop(Math.round(newTop))
					a.scrollElementTop = newTop
					a.rawSpeedY = endSpeed
					if ( a.scrollElement.scrollTop() == 0 && a.scrollElement.attr("data-overscroll") == "true") {
						/** handle over scroll */
						var currentTop = parseFloat(a.scrollElement.css("top"))
						var currentHeight = a.scrollElement.outerHeight()
						var currentTopRate = 1.0* currentTop / currentHeight
						endSpeed = initSpeed - 0.5*a.scrollDamping*initSpeed*deltatime*(1.0+150.0*currentTopRate)
						avgSpeed = (initSpeed + endSpeed) / 2.0
						deltaTop = avgSpeed * deltatime
						var newTopY = deltaTop+currentTop
						a.scrollElement.css("top",(newTopY).toString()+"px")
						a.rawSpeedY = endSpeed
					} else {
						/** search the up level scroll element */
					}
					a.touchUpdateScrollBar()
					a.touchShowScrollBar()
					if (Math.abs(deltaTop) < 0.05) {
						a.scrollElement.trigger("over-scroll-recovery")
					}

				}, 3, this)

			} else {
				this.scrollElement.trigger("over-scroll-recovery")
			}



		}
	}

	/**
	 * The function to initialize the touch events, which including setting up the elements and binding events
	 * @param  {Object} options The options to specialize the elements related for the touch events
	 * @return {[type]}         [description]
	 */
	pageTransition.prototype.initTouch = function(options) {

		/** unbind touch event for x direction and stop animations */
		this.touchXcontrollerStop()

		/** set new elements reflecting the current and previous pages */
		this.prevElement = $(options.prevPage)
		this.nowElement = $(options.nowPage)

		/** rebind the touch events */
		$(this.selector).bind("touchstart", this, function(event) {
			event.data.touchXcontrollerStartEvent(event)
			event.data.touchYcontrollerStartEvent(event)
		})
		$(this.selector).bind("touchmove", this, function(event) {
			event.data.touchXcontrollerMoveEvent(event)
			event.data.touchYcontrollerMoveEvent(event)
		})
		$(this.selector).bind("touchend", this, function(event) {
			event.data.touchXcontrollerEndEvent(event)
			event.data.touchYcontrollerEndEvent(event)
		})
		$(this.selector).bind("touchcancel", this, function(event) {
			event.data.touchXcontrollerEndEvent(event)
			event.data.touchYcontrollerEndEvent(event)
		})
	}

	/**
	 * Faculty entry for the pageTransition module
	 * @param  {String} selector The selector for the applied element
	 * @param  {Object} options  The setup for the transition
	 * @return {Instant/Object}  Created instant of the pageTransition module
	 */
	pageTransition.init = function(selector, options) {
		return new pageTransition(selector, options)
	}

	window.pageTransition = pageTransition
}());