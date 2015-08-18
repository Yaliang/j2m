;(function () {
	
	/**
	 * The module for native-like page transition between the pages of a multi-page web app
	 * 
	 */
	
	/**
	 * The first part load and manage the pages of the app
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
		 * The initial scale for the previous page
		 * @type {Number}
		 */
		this.initScale = options.initScale || 0.92

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
		 * obj contains 
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

		$("body").append(newPage)

		newPage.find("a").bind("click", this, function(event) {
			if ($(this).attr("data-nav") == "back") {
				event.data.backPage()
			} else {
				var href = $(this).attr("data-href")
				event.data.loadPage(href)
			}
		})

		var touchEventOptions = {}
		touchEventOptions.pageTransition = this
		touchEventOptions.prevPage = "#" + this.nowPage()
		touchEventOptions.nowPage = "#" + obj.pageId
		touchEventOptions.backFunction = this.backPage
		$(document).on("pageshow", "#"+obj.pageId, touchEventOptions, function(event) {
			/**
			 * Set the touch Events, this functionality might be able to move into load page function
			 */

			var touchEventOptions = event.data
			touchEventOptions.pageTransition.initTouch(touchEventOptions)

			/**
			 * Set the outerHeight of content element
			 */
			
			var window_height = $(window).height()
			var head_height = $(this).children(".ctrl-page-header").outerHeight()
			var foot_height = $(this).children(".ctrl-page-footer").outerHeight()

			$(this).children(".ctrl-page-content").outerHeight(window_height - head_height - foot_height).css("overflowY", "scroll")


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

		// console.log("called loadPage")
		var obj = fackget.get(id)
		// console.log(obj)
		// console.log(this)
		if ($("#"+id).length == 0) {
			var newPage = this.createPage(obj)
		}

		$( ":mobile-pagecontainer" ).pagecontainer( "change", "#"+obj.pageId, {
			transition: "none",
		} );

		this.pageStack.push(obj.pageId)

		return newPage
	}

	/**
	 * The function which need to be called when a back function triggered
	 * @author Yaliang
	 * @anotherdate 2015-08-17T21:11:34+0800
	 * @return      {[type]}                 [description]
	 */
	pageTransition.prototype.backPage = function() {
		this.nowElement.removeClass("ui-page-active")
		this.prevElement.addClass("ui-page-active")
		window.history.back()
		if (this.nowElement.attr("data-remove") != "forever") {
			this.pageTrash.push(this.nowElement)
		} else {
			this.nowElement.remove()
		}
		this.popPage()
	}

	pageTransition.prototype.touchAnimateStop = function() {
		this.touchXcontrollerStop()
		if (typeof this.selector != "undefined") {
			$(this.selector).unbind("touchstart").unbind("touchmove").unbind("touchend")
		}
	}

	pageTransition.prototype.touchXcontrollerStop = function() {
		if (typeof this.nowElement != "undefined" && this.nowElement.length > 0) {
			this.nowElement.stop()
			this.nowElement.css("left","")
		}

		if (typeof this.prevElement != "undefined" && this.prevElement.length > 0) {
			this.prevElement.stop()
			this.prevElement.css("transform", "").css("-webkit-transform", "").css("-moz-transform", "")
			this.prevElement.attr("data-scale","")
			this.prevElement.css("opacity", "")
			this.prevElement.css("display", "")
		}
	}

	pageTransition.prototype.touchXcontrollerStartEvent = function(event) {
		// console.log("start touch")
		// console.log(this)
		this.startX = event.originalEvent.touches[0].clientX
		this.currentX = this.startX
	}

	pageTransition.prototype.touchXcontrollerMoveEvent = function(event) {
		// console.log("move touch")
		// console.log(this)
		this.currentX = event.originalEvent.touches[0].clientX
		if (this.startX < this.leftActive && this.prevElement.length > 0) {
			this.prevElement.css("display", "block")
			$(this.selector).css("background-color","black")
			var distance = this.currentX - this.startX
			var fullwidth = $(window).width()
			this.nowElement.children(".ui-content").outerWidth(fullwidth)
			this.nowElement.css("left", Math.max(distance, 0).toString()+"px")
			this.nowElement.css("width", (fullwidth - Math.max(distance, 0)).toString()+"px")
			var prevElementScale = this.initScale + (1.0 - this.initScale)*(1.0*this.currentX / fullwidth)
			var scaleString = "scale("+prevElementScale.toString()+","+prevElementScale.toString()+")"
			this.prevElement.css("transform", scaleString).css("-webkit-transform", scaleString).css("-moz-transform", scaleString)
			this.prevElement.attr("data-scale", prevElementScale.toString())
			var prevElementOpac = this.initOpac + (1.0 - this.initOpac)*(1.0*this.currentX / fullwidth)
			this.prevElement.css("opacity", prevElementOpac.toString())
		} else {
			this.touchXcontrollerStop()
		}
	}

	pageTransition.prototype.touchXcontrollerEndEvent = function(event) {
		if (this.startX < this.leftActive && this.prevElement.length > 0) {
			var distance = this.currentX - this.startX
			var fullwidth = $(window).width()
			this.nowElement.children(".ui-content").css("width","")
			this.nowElement.css("width", "")
			if (distance > this.backActive * fullwidth) {
				this.nowElement.bind("transition-done", this, function(event) {
					event.data.touchXcontrollerStop()
					event.data.backPage()
					$(this).unbind("transition-done")
				})
				this.nowElement.animate({
					"left": fullwidth
				}, {
					duration: 100,
					complete: function() {
						$(this).trigger("transition-done")
					}
				})

				this.prevElement.animate({
					"opacity": "1",
				}, {
					duration: 100,
					progress: function(animate, now, remain) {
						var initScale = parseFloat($(this).attr("data-scale"))
						var nowScale = initScale + (1.0 - initScale)*(1.0*now) 
						var nowScaleStr = "scale("+nowScale.toString()+","+nowScale.toString()+")"
						$(this).css("transform",nowScaleStr).css("-webkit-transform",nowScaleStr).css("-moz-transform", nowScaleStr)
					}
				})
			} else {
				this.nowElement.bind("transition-cancel", this, function(event) {
					event.data.touchXcontrollerStop()
					$(this).unbind("transition-cancel")
				})
				this.nowElement.animate({
					"left": "0"
				}, {
					duration: 100,
					complete: function() {
						$(this).trigger("transition-cancel")
					}
				})

				this.prevElement.animate({
					"opacity": this.initOpac.toString()
				}, {
					duration: 100,
					progress: function(animate, now, remain) {
						var initScale = parseFloat($(this).attr("data-scale"))
						var nowScale = initScale + (pageTransition.initScale - initScale)*(1.0*now) 
						var nowScaleStr = "scale("+nowScale.toString()+","+nowScale.toString()+")"
						$(this).css("transform",nowScaleStr).css("-webkit-transform",nowScaleStr).css("-moz-transform", nowScaleStr)
					}
				})
			}
		} else {
			// console.log(this)
			this.touchXcontrollerStop()
		}
	}

	pageTransition.prototype.initTouch = function(options) {
		// console.log(this)
		this.touchAnimateStop()
		this.prevElement = $(options.prevPage)
		this.nowElement = $(options.nowPage)
		$(this.selector).bind("touchstart", this, function(event) {
			event.data.touchXcontrollerStartEvent(event)
		})
		$(this.selector).bind("touchmove", this, function(event) {
			event.data.touchXcontrollerMoveEvent(event)
		})
		$(this.selector).bind("touchend", this, function(event) {
			event.data.touchXcontrollerEndEvent(event)
		})
	}

	pageTransition.init = function(selector, options) {
		return new pageTransition(selector, options)
	}

	window.pageTransition = pageTransition
}());