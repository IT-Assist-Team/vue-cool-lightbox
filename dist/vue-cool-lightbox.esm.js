import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import axios from 'axios';

var attributes = ['media', 'srcset', 'sizes', 'src'];

var LazyLoadDirective = {
  inserted: function (el) {

    function loadImage() {
      var imageElement = findChild(el, 'img');
      var pictureElement = findChild(el, 'picture');
      if (imageElement) {
        setLoadListeners(imageElement);
        swapAttributes(imageElement);
      } else if (pictureElement) {
        var pictureImg = findChild(pictureElement, 'img');
        var pictureSources = Array.from(pictureElement.children).filter(
            function (child) { return child.nodeName === "SOURCE"; }
        );
        if (pictureImg) {
          setLoadListeners(pictureImg);
          if (pictureSources.length) {
            pictureSources.forEach(function (source) {
              swapAttributes(source);
            });
          }
          swapAttributes(pictureImg);
        }
      }
    }

    function handleIntersect(entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(el);
        }
      });
    }

    function createObserver() {
      var options = {
        root: null,
        threshold: "0"
      };
      var observer = new IntersectionObserver(handleIntersect, options);
      observer.observe(el);
    }
    if (window["IntersectionObserver"]) {
      createObserver();
    } else {
      loadImage();
    }
  }
};

function swapAttributes(el) {
  attributes.forEach(function (attribute) {
    var dataAttribute = el.dataset[attribute];
    if (dataAttribute) {
      el[attribute] = dataAttribute;
      el.removeAttribute(("data-" + attribute));
    }
  });
}

function setLoadListeners(el) {
  el.addEventListener("load", function () {
    setTimeout(function () { return el.classList.add("loaded"); }, 100);
  });
  el.addEventListener("error", function () { return console.log("error"); });
}

function findChild(parent, nodeName) {
  return Array.from(parent.children).find(
      function (el) { return el.nodeName === nodeName.toUpperCase(); }
  );
}

var AutoplayObserver = {
    inserted: function (el) {
      // getYoutube ID
      function isYoutubeVideo(url) {

        // youtube data
        var youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        var ytId = (url.match(youtubeRegex)) ? RegExp.$1 : false;

        if(ytId) {
          return true;
        }

        return false;
      }

      function autoplayVideo() {
        var tagName = el.tagName;
        var autoplay = el.dataset.autoplay; 
        if(autoplay) {
          if(tagName === 'VIDEO') {
            el.muted = true;
            el.autoplay = true;

            return;
          }

          if(tagName === 'IFRAME') {
            var url = new URL(el.src);
            var muted = 'muted';

            if(isYoutubeVideo(el.src)) {
              muted = 'mute';
            }

            // append autoplay
            url.searchParams.append(muted, 1);
            url.searchParams.append('autoplay', 1);

            el.src = url.href;
          }
        }
      }
  
      function handleIntersect(entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            autoplayVideo();
            observer.unobserve(el);
          }
        });
      }
  
      function createObserver() {
        var options = {
          root: null,
          threshold: "0"
        };
        var observer = new IntersectionObserver(handleIntersect, options);
        observer.observe(el);
      }
      if (window["IntersectionObserver"]) {
        createObserver();
      } else {
        loadImage();
      }
    }
  };

//

var script = {
  directives: {
    lazyload: LazyLoadDirective,
    autoplayObserver: AutoplayObserver,
  },

  data: function data() {
    return {
      // swipe data
      initialMouseX: 0,
      initialMouseY: 0,
      endMouseX: 0,
      endMouseY: 0,
      swipeType: null,
      IsSwipping: false,
      isDraggingSwipe: false,

      // use for mouse wheel
      prevTime: 0,

      // swipe effect
      xSwipeWrapper: 0,
      ySwipeWrapper: 0,
      swipeAnimation: null,
      swipeInterval: null,
      lightboxInnerWidth: null,

      // styles data
      imgIndex: this.index,
      isVisible: false,
      paddingBottom: false,
      imageLoading: false,
      showThumbs: false,
      isFullScreenMode: false,

      // props to bind styles
      buttonsVisible: true,
      scale: 1,
      top: 0,
      left: 0,
      lastX: 0,
      lastY: 0,
      isDraging: false,
      canZoom: true,
      isZooming: false,
      transition: 'all .3s ease',
      zoomBar: 0,

      // slideshow playing data
      isPlayingSlideShow: false,
      intervalProgress: null,
      loopData: false,
      stylesInterval: {
        'display': 'block'
      }
    };
  },

  props: {
    index: {
      required: true
    },

    effect: {
      type: String,
      default: 'swipe'
    },

    items: {
      type: Array,
      required: true,
    },

    loop: {
      type: Boolean,
      default: true,
    },

    slideshow: {
      type: Boolean,
      default: true,
    },

    slideshowColorBar: {
      type: String,
      default: '#fa4242',
    },

    slideshowDuration: {
      type: Number,
      default: 3000,
    },
    
    useZoomBar: {
      type: Boolean,
      default: false,
    },

    closeOnClickOutsideMobile: {
      type: Boolean,
      default: false,
    },
    
    srcName: {
      type: String,
      default: 'src',
    },

    srcSetName: {
      type: String,
      default: 'srcset'
    },
    
    srcThumb: {
      type: String,
      default: 'thumb',
    },

    srcMediaType: {
      type: String,
      default: 'mediaType',
    },

    overlayColor: {
      type: String,
      default: 'rgba(30, 30, 30, .9)'
    },

    zIndex: {
      type: Number,
      default: 9999,
    },

    gallery: {
      type: Boolean,
      default: true,
    },

    fullScreen: {
      type: Boolean,
      default: false,
    },

    thumbsPosition: {
      type: String,
      default: 'right',
    },

    youtubeCookies: {
      type: Boolean,
      default: true,
    },

    enableWheelEvent: {
      type: Boolean,
      default: false,
    },

    showCloseButton: {
      type: Boolean,
      default: true,
    },
    
    disableZoom: {
      type: Boolean,
      default: false,
    },

    dir: {
      type: String,
      default: 'ltr',
    },

    enableScrollLock: {
      type: Boolean,
      default: true,
    },
  },

  watch: {

    showThumbs: function showThumbs(prev, val) {
      var widthGalleryBlock = 212;
      var swipeAnimation = 'all .3s ease';
      if(window.innerWidth < 767) {
        widthGalleryBlock = 102;
        swipeAnimation = null;
      }

      if (this.thumbsPosition === 'bottom') {
        widthGalleryBlock = 0;
      }

      var self = this;
      this.swipeAnimation = swipeAnimation;

      if(prev) {

        if(this.dir === 'rtl') {
          this.xSwipeWrapper = this.imgIndex*(window.innerWidth - widthGalleryBlock) + 30*this.imgIndex;
        } else {
          this.xSwipeWrapper = -this.imgIndex*(window.innerWidth - widthGalleryBlock) - 30*this.imgIndex;
        }

      } else {
        
        if(this.dir === 'rtl') {
          this.xSwipeWrapper = this.imgIndex*window.innerWidth + 30*this.imgIndex;
        } else {
          this.xSwipeWrapper = -this.imgIndex*window.innerWidth - 30*this.imgIndex;
        }

      }

      setTimeout(function() {
        self.swipeAnimation = null;
      }, 300);
    },

    index: function index(prev, val) {
      var self = this;
      
      // body scroll lock
      var $body = document.querySelector('body');

      if(prev !== null) {
        
        // swipe type
        this.swipeType = null;
        this.initialMouseY = 0;
        this.ySwipeWrapper = 0;
        
        // set loop from data
        this.loopData = this.loop;

        // swipe effect case remove loop
        if(this.effect === 'swipe') {
          this.loopData = false;
          window.addEventListener('resize', this.xPositionOnResize);
        }

        // add img index
        this.imgIndex = prev;
        this.isVisible = true;

        // add events listener
        window.addEventListener('keydown', this.eventListener);

        // add wheel event
        if(this.enableWheelEvent) {
          window.addEventListener('wheel', this.wheelEvent);
        }
        
        // only in mobile
        if(window.innerWidth < 700) {

          // add click event
          setTimeout(function() {
            window.addEventListener('click', self.showButtons);
          }, 200);
        }

        if (this.enableScrollLock) {
          setTimeout(function() {
            self.setCompensateForScrollbar();
            disableBodyScroll(self.$refs.coolLightbox);
          }, 50);
        }

      } else {

        // hide and stop slideshow
        this.isVisible = false;
        this.stopSlideShow();

        // set starts X to 0
        this.startsX = 0;
        this.initialMouseY = 0;
        this.swipeType = null;

        // clear interval
        clearInterval(this.swipeInterval);
        this.swipeAnimation = null;

        // finish swipe
        this.isDraggingSwipe = false;
        this.isZooming = true;

        // remove events listener
        window.removeEventListener('keydown', this.eventListener);

        if (this.enableScrollLock) {
          self.removeCompensateForScrollbar();
          enableBodyScroll(self.$refs.coolLightbox);
        }

        // remove click event
        window.removeEventListener('click', this.showButtons);

        // remove resize event
        window.removeEventListener('resize', this.xPositionOnResize);
        
        // remove wheel event
        if(this.enableWheelEvent) {
          window.removeEventListener('wheel', this.wheelEvent);
        }
      }

    }, 
    
    imgIndex: function imgIndex(prev, val) {
      var this$1 = this;
      
      // when animation is loaded
      this.$nextTick(function () {

        if(this$1.effect === 'swipe') {
          this$1.setLightboxInnerWidth();
          this$1.setXPosition(prev);
        }
        
        if(prev !== null & val === null) {
          this$1.$emit("on-open", prev);
        }

        if(prev !== null) {
          if(prev !== val) {
            if(!this$1.getYoutubeUrl(this$1.getItemSrc(prev)) && !this$1.getVimeoUrl(this$1.getItemSrc(prev))) {
              this$1.stopVideos();
            }
          }

          // if is an image change imageLoading to true
          if(!this$1.getVideoUrl(this$1.getItemSrc(prev))) {
            if(!this$1.is_cached(this$1.getItemSrc(prev))) {
              this$1.imageLoading = true;
            }
          }

          // add caption padding to Lightbox wrapper
          this$1.addCaptionPadding();
          
        }

      });
    }, 
  },

  beforeDestroy: function beforeDestroy () {
    if (this.enableScrollLock) {
      this.removeCompensateForScrollbar();
      if(this.$refs.coolLightbox) {
        enableBodyScroll(this.$refs.coolLightbox);
      }
    }
  },

  methods: {
    Download: function Download() {
      var imageSrc = this.getItemSrc(this.imgIndex);
      imageSrc = imageSrc.replace('size=small', '').replace('size=medium','');
      axios.get(imageSrc, {
        withCredentials: true,
        responseType: 'blob'
      }).then(function (response) {
          var reader = new window.FileReader();
          reader.readAsDataURL(response.data); 
          reader.onload = function() {
            var imageDataUrl = reader.result;
            console.log(imageDataUrl);
            var link = document.createElement('a');
            link.href = imageDataUrl;
            console.log(response.headers);
            link.download = response.headers['x-file-name'];
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
      });
    },
    Delete: function Delete() {
      var this$1 = this;

      var imageSrc = this.getItemSrc(this.imgIndex);
      imageSrc = imageSrc.replace('size=small', '').replace('size=medium','');
      axios.delete(imageSrc, {
        withCredentials: true,
      }).then(function (response) {
        this$1.close();
      });
    },
    getExtFromItem: function getExtFromItem(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      if(this.checkIfIsObject(imgIndex)) {
        var item = this.items[imgIndex];

        //item extension is specified, so return it
        if (item['ext']) {
          return item['ext']
        }

        return 'mp4';
      }
    },

    stopVideos: function stopVideos() {
      var videos = document.getElementsByClassName("cool-lightbox-video");
      var isVideoPlaying = function (video) { return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2); };
      if(videos.length > 0) {
        Array.prototype.forEach.call(videos, function (video) {
          var type = video.tagName;
          
          if(type === 'IFRAME') {
            var iframeSrc = video.src;
            return video.src = iframeSrc;
          }

          if(isVideoPlaying(video)) {
            return video.pause();
          }

        });
      }
    }, 

    removeCompensateForScrollbar: function removeCompensateForScrollbar() {
      document.body.classList.remove("compensate-for-scrollbar");
      var noscrollStyle = document.getElementById("coollightbox-style-noscroll");
      if(noscrollStyle !== null) {
        document.getElementById("coollightbox-style-noscroll").remove();
      }
    },

    setCompensateForScrollbar: function setCompensateForScrollbar() {
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (
        !isMobile &&
        document.body.scrollHeight > window.innerHeight
      ) {
        document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend',
          '<style id="coollightbox-style-noscroll" type="text/css">.compensate-for-scrollbar{margin-right:' +
            (window.innerWidth - document.documentElement.clientWidth) +
          "px;}</style>"
        );

        document.body.classList.add("compensate-for-scrollbar");
      }
    }, 

    setAutoplay: function setAutoplay(itemIndex) {
      if(this.checkIfIsObject(itemIndex) && this.items[itemIndex].hasOwnProperty('autoplay') && this.items[itemIndex].autoplay) {
        return true;
      }

      return false;
    },

    toggleFullScreenMode: function toggleFullScreenMode() {
      if(this.isFullScreenMode) {
        this.closeFullscreen();
      } else {
        this.fullScreenMode();
      }

      this.isFullScreenMode = !this.isFullScreenMode;
    },

    closeFullscreen: function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    },

    fullScreenMode: function fullScreenMode() {
      /* Get the documentElement (<html>) to display the page in fullscreen */
      var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
    },

    // check if event is arrow button or toolbar button
    checkIfIsButton: function checkIfIsButton(event) {
      var elements = '.cool-lightbox__iframe *, .cool-lightbox-button, .cool-lightbox-button *, .cool-lightbox-toolbar__btn, .cool-lightbox-toolbar__btn *, .cool-lightbox-caption h6, .cool-lightbox-caption p, .cool-lightbox-caption a';
      if (event.target.matches(elements)) {
        return true
      }

      return false
    },

    // check if the image is cached
    is_cached: function is_cached(src) {
      var image = new Image();
      image.src = src;

      return image.complete;
    },

    // image loaded event
    imageLoaded: function imageLoaded() {
      this.imageLoading = false;
    },

    // get video url
    itemThumb: function itemThumb(itemUrl, itemIndex) {

      var thumb = this.getItemThumb(itemIndex);
      if(thumb) {
        return thumb
      }

      var youtubeID = this.getYoutubeID(itemUrl);
      if(youtubeID) {
        return 'https://img.youtube.com/vi/'+youtubeID+'/mqdefault.jpg'
      }

      var vimeoID = this.getVimeoID(itemUrl);
      if(vimeoID) {
        return false
      }

      return itemUrl
    },

    isItemPicture: function isItemPicture(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item.picture
      }

      return false
    },

    getPictureSources: function getPictureSources(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var picture = this.items[imgIndex].picture;

      return picture.sources ? picture.sources : []
    },
    
    // get item src
    getItemSrc: function getItemSrc(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcName]
      }

      return item
    },

    getItemSrcSet: function getItemSrcSet(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcSetName]
      }

      return null
    },

    getItemSizes: function getItemSizes(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item.sizes
      }

      return null
    },
    
    getItemAlt: function getItemAlt(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item.alt;
      }

      return null
    },

    getItemThumb: function getItemThumb(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      var item = this.items[imgIndex];
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcThumb]
      } 

      if(this.getVideoUrl(item)) {
        return false
      }

      return item
    },

    // get item media type
    getMediaType: function getMediaType(imgIndex) {
      if(imgIndex === null) {
        return false
      }
      
      if(this.checkIfIsObject(imgIndex)) {
        
        var item$1 = this.items[imgIndex];

        //item type is specified, so return it
        if (item$1[this.srcMediaType]) {
          return item$1[this.srcMediaType]
        }
      }

      if (this.getItemSrc(imgIndex).indexOf('type=vid') != -1) {
        return 'video'
      }
    
      if (this.getVideoUrl(this.getItemSrc(imgIndex))) {
        return 'video'
      } else if (this.getPDFurl(this.getItemSrc(imgIndex))) { 
        return 'iframe'
      } else {
        return 'image'
      }
    },

    // toggle play slideshow event
    togglePlaySlideshow: function togglePlaySlideshow() {
      if(!this.slideshow) {
        return false
      }

      if(!this.hasNext && !this.loopData) {
        return false
      }
      this.isPlayingSlideShow = !this.isPlayingSlideShow;

      // if is playing move if not stop it
      if(this.isPlayingSlideShow) {
        this.move();
      } else {
        this.stopSlideShow();
      }
    },

    // stop slideshow
    stopSlideShow: function stopSlideShow() {
      this.isPlayingSlideShow = false;
      clearInterval(this.intervalProgress);
      this.stylesInterval = {
        'transform': 'scaleX(0)',
        'transition': 'none',
      };
    },

    // move event in zoom
    move: function move() {
      var self = this;
      this.progressWidth = 100;
      this.intervalProgress = setInterval(frame, this.slideshowDuration + 90);
      
      self.stylesInterval = {
        'transform': 'scaleX(1)',
        'background': this.slideshowColorBar,
        'transition-duration': this.slideshowDuration+'ms',
      };
      function frame() {
        self.stylesInterval = {
          'transform': 'scaleX(0)',
          'transition': 'none',
        };
        
        if(self.dir === 'rtl') {
          self.onPrevClick(true);
        } else {
          self.onNextClick(true);
        }

        if(!self.hasNext && !self.loopData) {
          self.stopSlideShow();
        } else {
          setTimeout(function() {
            self.stylesInterval = {
              'transform': 'scaleX(1)',
              'background': self.slideshowColorBar,
              'transition-duration': self.slideshowDuration+'ms',
            };
          }, 50);
        }
      }
    }, 

    // show buttons event
    showButtons: function showButtons(event) {
      if (!this.checkIfIsButton(event)) {
        var self = this;
        setTimeout(function() {
          self.buttonsVisible = !self.buttonsVisible;
        }, 100);
      }
    },

    // check if is allowed to drag
    checkMouseEventPropButton: function checkMouseEventPropButton(button) {
      if (!this.isZooming) { return false }
      // mouse left btn click
      return button === 0
    },
  
    // close event
    close: function close() {
      this.stopSlideShow();
      this.$emit("close", this.imgIndex);
      this.showThumbs = false;
      this.imgIndex = null;
    },

    wheelEvent: function wheelEvent(event) {
      var delay = 350;
      var currentTime = new Date().getTime();
      var direction = event.deltaY > 0 ? 'top' : 'down';

      if (currentTime - this.prevTime < delay) { return; }

      this.prevTime = currentTime;

      switch (direction) {
        case 'top':
          return this.changeIndexToPrev();
        case 'down':
          return this.changeIndexToNext();
      }
    },

    // close event click outside
    closeModal: function closeModal(event) {
      if(!this.closeOnClickOutsideMobile) {
        if(window.innerWidth < 700) {
          return false;
        }
      }

      if(this.IsSwipping) {
        return false;
      }

      var elements = '.cool-lightbox__iframe, .cool-lightbox__iframe *, .cool-lightbox-zoom, .cool-lightbox-zoom *, .cool-lightbox-thumbs, svg, path, rect, .cool-lightbox-thumbs *, .cool-lightbox-button, .cool-lightbox-toolbar__btn, .cool-lightbox-toolbar__btn *, .cool-lightbox-button *, .cool-lightbox__slide__img *, .cool-lightbox-video, .cool-lightbox-caption h6, .cool-lightbox-caption p, .cool-lightbox-caption a';
      if (!event.target.matches(elements)) {
        this.close();
      }
    },

    // next slide event
    onNextClick: function onNextClick(isFromSlideshow) {
      if ( isFromSlideshow === void 0 ) isFromSlideshow = false;

      if(this.isZooming) {
        return false;
      }

      if(!isFromSlideshow) {
        this.stopSlideShow();
      }


      if(this.dir === 'rtl') {
        return this.changeIndexToPrev();
      }

      this.changeIndexToNext();
    },

    // prev slide event
    onPrevClick: function onPrevClick(isFromSlideshow) {
      if ( isFromSlideshow === void 0 ) isFromSlideshow = false;

      if(this.isZooming) {
        return false;
      }
      
      if(!isFromSlideshow) {
        this.stopSlideShow();
      }
      
      if(this.dir === 'rtl') {
        return this.changeIndexToNext();
      }

      this.changeIndexToPrev();
    },

    // change to next index
    changeIndexToNext: function changeIndexToNext() {
      if(this.hasNext) {
        this.onIndexChange(this.imgIndex + 1);
      } else {
        // only if has loop prop
        if(this.loopData) {
          this.onIndexChange(0);
        }
      }
    },

    // change to prev index
    changeIndexToPrev: function changeIndexToPrev() {
      if(this.hasPrevious) {
        this.onIndexChange(this.imgIndex - 1);
      } else {
        // only if has loop prop
        if(this.loopData) {
          this.onIndexChange(this.items.length - 1);
        }
      }
    },

    // set lightbox inner width
    setLightboxInnerWidth: function setLightboxInnerWidth() {
      var el = document.getElementsByClassName('cool-lightbox__inner');
      var width = el[0].clientWidth;
      this.lightboxInnerWidth = width;
    },

    // x position on resize event
    xPositionOnResize: function xPositionOnResize() {
      this.setLightboxInnerWidth();
      var index = this.imgIndex;

      if(this.dir === 'rtl') {
        this.xSwipeWrapper = index*this.lightboxInnerWidth+30*index;
        return;
      }

      // set x position
      this.xSwipeWrapper = -index*this.lightboxInnerWidth-30*index;
    },

    // set x position by img index
    setXPosition: function setXPosition(index) {
      if(this.dir === 'rtl') {
        this.xSwipeWrapper = index*this.lightboxInnerWidth+30*index;
        return
      }

      // set x position
      this.xSwipeWrapper = -index*this.lightboxInnerWidth-30*index;
      return; 
    },

    // index change
    onIndexChange: function onIndexChange(index) {
      var self = this;
      this.imgIndex = index;
      this.$emit('on-change', index);

      setTimeout(function() {
        self.$emit('on-change-end', index);
      }, 400);
    },

    // caption size 
    addCaptionPadding: function addCaptionPadding() {
      if(this.checkIfIsObject(this.imgIndex) && (this.items[this.imgIndex].title || this.items[this.imgIndex].descripcion)) {
        var el = document.getElementsByClassName('cool-lightbox-caption');
        if(el.length > 0) {
          this.paddingBottom = el[0].offsetHeight;
        } 
      } else {
        this.paddingBottom = 60;
      }
    },

    getPDFurl: function getPDFurl(url) {
      if(this.imgIndex === null) {
        return false
      }

      var str = new String(url);
      if(str.endsWith('.pdf')){
        return url
      }

      return false
    },

    // check if is video
    getVideoUrl: function getVideoUrl(itemSrc) {

      var mp4Url = this.checkIsMp4(itemSrc);
      if(mp4Url) {
        return mp4Url
      }

      return false
    },
    
    // getYoutube ID
    getYoutubeID: function getYoutubeID(url) {
      return false
    },

    // get youtube url
    getYoutubeUrl: function getYoutubeUrl(url) {

      // youtube data
      var ytId = this.getYoutubeID(url);

      // if is youtube video
      if(ytId) {

        // check if allows youtube cookies
        if(this.youtubeCookies) {
          return 'https://www.youtube.com/embed/'+ytId
        }

        return 'https://www.youtube-nocookie.com/embed/'+ytId
      }

      return false
    },

    // vimeo ID
    getVimeoID: function getVimeoID(url) {
      
      return false
    },

    // get vimeo url
    getVimeoUrl: function getVimeoUrl(url) {

      return false
    },

    // check if video is mp4
    checkIsMp4: function checkIsMp4(url) {
      if(this.imgIndex === null) {
        return false
      }

      var str = new String(url);
      if(
        (str.indexOf('.mp4') !== -1) || 
        (str.indexOf('.mov') !== -1) || 
        (str.indexOf('.webm') !== -1) || 
        (str.indexOf('.ogg') !== -1) || 
        (str.indexOf('.avi') !== -1) ||
        (str.indexOf('type=vid') !== -1)
      ) {
        return url
      }

      return false
    },

    // if is video get extension
    getVideoExt: function getVideoExt(url) {
      if(this.imgIndex === null) {
        return false
      }

      var str = new String(url);
      if(str.indexOf('.mp4') !== -1 || str.indexOf('.mov') !== -1){
        return 'mp4'
      }

      if(str.indexOf('.webm') !== -1) {
        return 'webm'
      }

      if(str.indexOf('.ogg') !== -1) {
        return 'ogg'
      }
      
      if(str.indexOf('.avi') !== -1) {
        return 'avi'
      }

      return false
    },

    // check if item is object
    checkIfIsObject: function checkIfIsObject(itemIndex) {
      var item = this.items[itemIndex];
      if(typeof item === 'object' && item !== null) {
        return true
      }
      return false;
    },

    // arrows and escape events
    eventListener: function eventListener(e) {
      switch (e.keyCode) {
        case 39:
          return this.onNextClick()
        case 37:
          return this.onPrevClick()
        case 38:
        case 40:
        case ' ':
          return e.preventDefault()
        case 27:
          return this.close()
      }
    },
  },

  computed: {
    
    // Images wrapper styles to use drag and zoom
    imgWrapperStyle: function imgWrapperStyle() {
      return {
        top: "50%",
        left: "50%",
        transition: this.transition,
      }
    },

    // lightbox styles
    lightboxStyles: function lightboxStyles() {
      return { 
        'z-index': this.zIndex,
        'background-color': this.overlayColor,
      }
    },

    innerStyles: function innerStyles() {
      return {
        'padding-bottom': this.paddingBottom+'px',
      }
    },

    // get item src
    itemSrc: function itemSrc() {
      if(this.imgIndex === null) {
        return false
      }

      var item = this.items[this.imgIndex];
      if(this.checkIfIsObject(this.imgIndex)) {
        return item[this.srcName]
      }

      return item
    },

    // Lightbox classes
    lightboxClasses: function lightboxClasses() {
      var classesReturn = [
        { 'cool-lightbox--can-zoom': this.canZoom && !this.disableZoom },
        { 'cool-lightbox--zoom-disabled': this.disableZoom},
        { 'cool-lightbox--is-zooming': this.isZooming },
        { 'cool-lightbox--show-thumbs': this.showThumbs },
        { 'cool-lightbox--is-swipping': this.isDraggingSwipe }
      ];

      var classString = 'cool-lightbox--thumbs-'+this.thumbsPosition;
      classesReturn.push(classString);

      return classesReturn
    },

    // Buttons classes
    buttonsClasses: function buttonsClasses() {
      return {
        'hidden': !this.buttonsVisible,
      }
    },

    // check if the slide has next element
    hasNextButton: function hasNextButton() {
      if(this.dir === 'rtl') {
        return (this.imgIndex - 1 >= 0)
      }
        
      return (this.imgIndex + 1 < this.items.length)
    },

    // check if the slide has previous element 
    hasPreviousButton: function hasPreviousButton() {
      if(this.dir === 'rtl') {
        return (this.imgIndex + 1 < this.items.length)
      }

      return (this.imgIndex - 1 >= 0)
    },

    // check if the slide has next element
    hasNext: function hasNext() {
      return (this.imgIndex + 1 < this.items.length)
    },

    // check if the slide has previous element 
    hasPrevious: function hasPrevious() {
      return (this.imgIndex - 1 >= 0)
    },
  },
  mounted: function mounted() {
    console.log('Init Cool Lightbox! V2.3');
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
var __vue_script__ = script;
/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"cool-lightbox-modal"}},[(_vm.isVisible)?_c('div',{ref:"coolLightbox",staticClass:"cool-lightbox",class:_vm.lightboxClasses,style:(_vm.lightboxStyles),on:{"click":_vm.closeModal}},[(_vm.gallery)?_c('div',{staticClass:"cool-lightbox-thumbs"},[_c('div',{staticClass:"cool-lightbox-thumbs__list"},_vm._l((_vm.items),function(item,itemIndex){return _c('button',{key:itemIndex,staticClass:"cool-lightbox__thumb",class:{ 
            active: itemIndex === _vm.imgIndex,
            'is-video': _vm.getMediaType(itemIndex) === 'video' 
          },attrs:{"type":"button"},on:{"click":function($event){_vm.imgIndex = itemIndex;}}},[(_vm.getMediaType(itemIndex) === 'video')?_c('svg',{staticClass:"cool-lightbox__thumb__icon",attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 24 24"}},[_c('path',{attrs:{"d":"M6.5 5.4v13.2l11-6.6z"}})]):_vm._e(),_vm._v(" "),_c('img',{attrs:{"src":_vm.itemThumb(_vm.getItemSrc(itemIndex), itemIndex),"alt":""}})])}),0)]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"cool-lightbox__inner",style:(_vm.innerStyles)},[_c('div',{staticClass:"cool-lightbox__progressbar",style:(_vm.stylesInterval)}),_vm._v(" "),(_vm.effect === 'swipe')?_c('div',{staticClass:"cool-lightbox__wrapper cool-lightbox__wrapper--swipe",style:({
          transform: 'translate3d('+_vm.xSwipeWrapper+'px, '+_vm.ySwipeWrapper+'px, 0)',
          transition: _vm.swipeAnimation
        })},_vm._l((_vm.items),function(item,itemIndex){return _c('div',{key:itemIndex,ref:"items",refInFor:true,staticClass:"cool-lightbox__slide",class:{ 'cool-lightbox__slide--current': itemIndex === _vm.imgIndex }},[(itemIndex === _vm.imgIndex)?_c('div',{staticStyle:{"margin-left":"auto","margin-right":"auto"}},[(_vm.getMediaType(itemIndex) === 'image')?_c('div',{directives:[{name:"lazyload",rawName:"v-lazyload"}],key:"image",staticClass:"cool-lightbox__slide__img",style:(_vm.imgWrapperStyle)},[(!_vm.isItemPicture(itemIndex))?_c('img',{key:itemIndex,attrs:{"data-src":_vm.getItemSrc(itemIndex),"data-srcset":_vm.getItemSrcSet(itemIndex),"data-sizes":_vm.getItemSizes(itemIndex),"draggable":"false","alt":_vm.getItemAlt(itemIndex)},on:{"load":_vm.imageLoaded}}):_c('picture',{key:itemIndex},[_vm._l((_vm.getPictureSources(itemIndex)),function(source,sourceIndex){return _c('source',{key:("source-" + _vm.imgIndex + "-" + sourceIndex),attrs:{"data-srcset":source.srcset,"data-media":source.media,"type":source.type,"data-sizes":source.sizes || _vm.getItemSizes(_vm.imgIndex)}})}),_vm._v(" "),_c('img',{attrs:{"data-src":_vm.getItemSrc(itemIndex),"data-srcset":_vm.getItemSrcSet(itemIndex),"data-sizes":_vm.getItemSizes(itemIndex),"draggable":"false","alt":_vm.getItemAlt(itemIndex)},on:{"load":_vm.imageLoaded}})],2),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.imageLoading),expression:"imageLoading"}],staticClass:"cool-lightbox-loading-wrapper"},[_vm._t("loading",[_c('div',{staticClass:"cool-lightbox-loading"})])],2)]):_c('div',{key:"video",staticClass:"cool-lightbox__iframe"},[((!_vm.checkIsMp4(_vm.getItemSrc(itemIndex)) && _vm.getMediaType(itemIndex) === 'video'))?_c('iframe',{directives:[{name:"autoplayObserver",rawName:"v-autoplayObserver"}],key:itemIndex,staticClass:"cool-lightbox-video",staticStyle:{"width":"100%","max-height":"70vh"},attrs:{"data-autoplay":_vm.setAutoplay(itemIndex),"src":_vm.getVideoUrl(_vm.getItemSrc(itemIndex)),"frameborder":"0","allow":"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture","allowfullscreen":""}}):_vm._e(),_vm._v(" "),((_vm.getMediaType(itemIndex) === 'iframe') || (_vm.getPDFurl(_vm.getItemSrc(itemIndex))))?_c('iframe',{key:itemIndex,staticClass:"cool-lightbox-pdf",attrs:{"src":_vm.getItemSrc(itemIndex),"frameborder":"0","allowfullscreen":""}}):_vm._e(),_vm._v(" "),(_vm.checkIsMp4(_vm.getItemSrc(itemIndex)) || _vm.getMediaType(itemIndex) === 'webVideo')?_c('video',{directives:[{name:"autoplayObserver",rawName:"v-autoplayObserver"}],key:_vm.checkIsMp4(_vm.getItemSrc(itemIndex)),staticClass:"cool-lightbox-video",staticStyle:{"width":"100%","max-height":"70vh"},attrs:{"data-autoplay":_vm.setAutoplay(itemIndex),"controls":"","controlslist":"nodownload","l":"","poster":""}},[_c('source',{attrs:{"src":_vm.checkIsMp4(_vm.getItemSrc(itemIndex)),"type":'video/'+(_vm.getVideoExt(_vm.getItemSrc(itemIndex)) ? _vm.getVideoExt(_vm.getItemSrc(itemIndex)) : _vm.getExtFromItem(itemIndex))}}),_vm._v("\n                Sorry, your browser doesn't support embedded videos\n              ")]):_vm._e()])]):_vm._e()])}),0):_vm._e(),_vm._v(" "),(_vm.effect === 'fade')?_c('div',{staticClass:"cool-lightbox__wrapper"},[_c('div',{ref:"items",staticClass:"cool-lightbox__slide cool-lightbox__slide--current"},[_c('div',{staticStyle:{"margin-left":"auto","margin-right":"auto"}},[_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[(_vm.getMediaType(_vm.imgIndex) === 'image')?_c('div',{key:"image",staticClass:"cool-lightbox__slide__img",style:(_vm.imgWrapperStyle)},[(!_vm.isItemPicture(_vm.imgIndex))?_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[_c('img',{key:_vm.imgIndex,attrs:{"src":_vm.getItemSrc(_vm.imgIndex),"srcset":_vm.getItemSrcSet(_vm.imgIndex),"sizes":_vm.getItemSizes(_vm.imgIndex),"draggable":"false","alt":_vm.getItemAlt(_vm.imgIndex)},on:{"load":_vm.imageLoaded}})]):_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[_c('picture',{key:_vm.imgIndex},[_vm._l((_vm.getPictureSources(_vm.imgIndex)),function(source,sourceIndex){return _c('source',{key:("source-" + _vm.imgIndex + "-" + sourceIndex),attrs:{"srcset":source.srcset,"type":source.type,"media":source.media,"sizes":source.sizes || _vm.getItemSizes(_vm.imgIndex)}})}),_vm._v(" "),_c('img',{attrs:{"src":_vm.getItemSrc(_vm.imgIndex),"srcset":_vm.getItemSrcSet(_vm.imgIndex),"sizes":_vm.getItemSizes(_vm.imgIndex),"draggable":"false","alt":_vm.getItemAlt(_vm.imgIndex)},on:{"load":_vm.imageLoaded}})],2)]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.imageLoading),expression:"imageLoading"}],staticClass:"cool-lightbox-loading-wrapper"},[_vm._t("loading",[_c('div',{staticClass:"cool-lightbox-loading"})])],2)],1):_c('div',{key:"video",staticClass:"cool-lightbox__iframe"},[_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[((!_vm.checkIsMp4(_vm.getItemSrc(_vm.imgIndex)) && _vm.getMediaType(_vm.imgIndex) === 'video'))?_c('iframe',{directives:[{name:"autoplayObserver",rawName:"v-autoplayObserver"}],key:_vm.getVideoUrl(_vm.getItemSrc(_vm.imgIndex)),staticClass:"cool-lightbox-video",staticStyle:{"width":"100%","max-height":"70vh"},attrs:{"data-autoplay":_vm.setAutoplay(_vm.imgIndex),"src":_vm.getVideoUrl(_vm.getItemSrc(_vm.imgIndex)),"frameborder":"0","allow":"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture","allowfullscreen":""}}):_vm._e(),_vm._v(" "),((_vm.getMediaType(_vm.imgIndex) === 'iframe') || (_vm.getPDFurl(_vm.getItemSrc(_vm.imgIndex))))?_c('iframe',{key:_vm.imgIndex,staticClass:"cool-lightbox-pdf",attrs:{"src":_vm.getItemSrc(_vm.imgIndex),"frameborder":"0","allowfullscreen":""}}):_vm._e(),_vm._v(" "),(_vm.checkIsMp4(_vm.getItemSrc(_vm.imgIndex)) || _vm.getMediaType(_vm.imgIndex) === 'webVideo')?_c('video',{directives:[{name:"autoplayObserver",rawName:"v-autoplayObserver"}],key:_vm.checkIsMp4(_vm.getItemSrc(_vm.imgIndex)),staticClass:"cool-lightbox-video",staticStyle:{"width":"100%","max-height":"70vh"},attrs:{"data-autoplay":_vm.setAutoplay(_vm.imgIndex),"controls":"","controlslist":"nodownload","poster":""}},[_c('source',{attrs:{"src":_vm.checkIsMp4(_vm.getItemSrc(_vm.imgIndex)),"type":'video/'+(_vm.getVideoExt(_vm.getItemSrc(_vm.imgIndex)) ? _vm.getVideoExt(_vm.getItemSrc(_vm.imgIndex)) : _vm.getExtFromItem(_vm.imgIndex))}}),_vm._v("\n                    Sorry, your browser doesn't support embedded videos\n                  ")]):_vm._e()])],1)])],1)])]):_vm._e(),_vm._v(" "),_c('transition',{attrs:{"name":"cool-lightbox-modal"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.checkIfIsObject(_vm.imgIndex) && (_vm.items[_vm.imgIndex].title || _vm.items[_vm.imgIndex].description)),expression:"checkIfIsObject(imgIndex) && (items[imgIndex].title || items[imgIndex].description)"}],key:"caption-block",staticClass:"cool-lightbox-caption"},[_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[(_vm.checkIfIsObject(_vm.imgIndex) && _vm.items[_vm.imgIndex].title)?_c('h6',{key:"title",domProps:{"innerHTML":_vm._s(_vm.items[_vm.imgIndex].title)}}):_vm._e()]),_vm._v(" "),_c('transition',{attrs:{"name":"cool-lightbox-slide-change","mode":"out-in"}},[(_vm.checkIfIsObject(_vm.imgIndex) && _vm.items[_vm.imgIndex].description)?_c('p',{key:"description",domProps:{"innerHTML":_vm._s(_vm.items[_vm.imgIndex].description)}}):_vm._e()])],1)]),_vm._v(" "),_c('div',{staticClass:"cool-lightbox-toolbar",class:_vm.buttonsClasses},[_c('button',{staticClass:"cool-lightbox-toolbar__btn",attrs:{"type":"button","title":"Download"},on:{"click":function($event){return _vm.Download()}}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 24 24"}},[_c('path',{attrs:{"d":"M17.064,4.656l-2.05-2.035C14.936,2.544,14.831,2.5,14.721,2.5H3.854c-0.229,0-0.417,0.188-0.417,0.417v14.167c0,0.229,0.188,0.417,0.417,0.417h12.917c0.229,0,0.416-0.188,0.416-0.417V4.952C17.188,4.84,17.144,4.733,17.064,4.656M6.354,3.333h7.917V10H6.354V3.333z M16.354,16.667H4.271V3.333h1.25v7.083c0,0.229,0.188,0.417,0.417,0.417h8.75c0.229,0,0.416-0.188,0.416-0.417V3.886l1.25,1.239V16.667z M13.402,4.688v3.958c0,0.229-0.186,0.417-0.417,0.417c-0.229,0-0.417-0.188-0.417-0.417V4.688c0-0.229,0.188-0.417,0.417-0.417C13.217,4.271,13.402,4.458,13.402,4.688"}})])]),_vm._v(" "),_c('button',{staticClass:"cool-lightbox-toolbar__btn",attrs:{"type":"button","title":"Download"},on:{"click":function($event){return _vm.Delete()}}},[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 24 24"}},[_c('path',{attrs:{"d":"M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"}})])]),_vm._v(" "),(_vm.fullScreen)?_c('button',{staticClass:"cool-lightbox-toolbar__btn",attrs:{"type":"button","title":"Fullscreen"},on:{"click":_vm.toggleFullScreenMode}},[_c('svg',{attrs:{"width":"20px","height":"20px","viewBox":"0 0 18 18","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"d":"M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"}})])]):_vm._e(),_vm._v(" "),(_vm.showCloseButton)?_c('button',{staticClass:"cool-lightbox-toolbar__btn",attrs:{"type":"button","title":"Close"},on:{"click":_vm.close}},[_vm._t("close",[_c('svg',{attrs:{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 24 24"}},[_c('path',{attrs:{"d":"M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"}})])])],2):_vm._e()])],1),_vm._v(" "),_c('transition',{attrs:{"name":"cool-lightbox-modal"}},[(_vm.isZooming && _vm.useZoomBar)?_c('div',{staticClass:"cool-lightbox-zoom"},[_c('svg',{staticClass:"cool-lightbox-zoom__icon",attrs:{"height":"469pt","viewBox":"0 -192 469.33333 469","width":"469pt","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"d":"m437.332031.167969h-405.332031c-17.664062 \n          0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 \n          32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"}})]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.zoomBar),expression:"zoomBar"}],attrs:{"type":"range","name":"points","min":"0","max":"50"},domProps:{"value":(_vm.zoomBar)},on:{"__r":function($event){_vm.zoomBar=$event.target.value;}}}),_vm._v(" "),_c('svg',{staticClass:"cool-lightbox-zoom__icon",attrs:{"height":"426.66667pt","viewBox":"0 0 426.66667 426.66667","width":"426.66667pt","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"d":"m405.332031 192h-170.664062v-170.667969c0-11.773437-9.558594-21.332031-21.335938-21.332031-11.773437 0-21.332031 \n          9.558594-21.332031 21.332031v170.667969h-170.667969c-11.773437 0-21.332031 9.558594-21.332031 21.332031 0 \n          11.777344 9.558594 21.335938 21.332031 21.335938h170.667969v170.664062c0 11.777344 9.558594 21.335938 21.332031 \n          21.335938 11.777344 0 21.335938-9.558594 21.335938-21.335938v-170.664062h170.664062c11.777344 0 21.335938-9.558594 \n          21.335938-21.335938 0-11.773437-9.558594-21.332031-21.335938-21.332031zm0 0"}})])]):_vm._e()])],1):_vm._e()])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CoolLightBox = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component("CoolLightBox", CoolLightBox);
}

var plugin = {
  install: install
};

var GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
}

CoolLightBox.install = install;

export default CoolLightBox;
