<template>
  <transition name="cool-lightbox-modal">
    <div class="cool-lightbox" 
      v-bind:class="lightboxClasses"
      v-if="isVisible" 
      ref="coolLightbox"
      @click="closeModal"
      v-bind:style="lightboxStyles">

      <div v-if="gallery" class="cool-lightbox-thumbs">
        <div class="cool-lightbox-thumbs__list">
          <button 
            type="button"
            v-for="(item, itemIndex) in items"
            :key="itemIndex"
            :class="{ 
              active: itemIndex === imgIndex,
              'is-video': getMediaType(itemIndex) === 'video' 
            }"
            @click="imgIndex = itemIndex"
            class="cool-lightbox__thumb">

            <svg class="cool-lightbox__thumb__icon" xmlns="http://www.w3.org/2000/svg" v-if="getMediaType(itemIndex) === 'video'" viewBox="0 0 24 24">
              <path d="M6.5 5.4v13.2l11-6.6z"></path>
            </svg>

            <img :src="itemThumb(getItemSrc(itemIndex), itemIndex)" alt="" />
          </button>
        </div>
      </div>
      <!--/cool-lightbox-thumbs-->

      <div 
        class="cool-lightbox__inner" 
        :style="innerStyles"
        >
        <div class="cool-lightbox__progressbar" :style="stylesInterval"></div>

        <!--/cool-lightbox__navigation-->

        <div v-if="effect === 'swipe'" 
          class="cool-lightbox__wrapper cool-lightbox__wrapper--swipe"
          :style="{
            transform: 'translate3d('+xSwipeWrapper+'px, '+ySwipeWrapper+'px, 0)',
            transition: swipeAnimation
          }"
          >
          <div 
            v-for="(item, itemIndex) in items"
            :key="itemIndex"
            ref="items"
            class="cool-lightbox__slide"
            :class="{ 'cool-lightbox__slide--current': itemIndex === imgIndex }"
          >
            <div v-if="itemIndex === imgIndex" style="margin-left: auto; margin-right: auto;">
              <div 
                  v-lazyload
                  v-if="getMediaType(itemIndex) === 'image'" key="image" :style="imgWrapperStyle" class="cool-lightbox__slide__img">
                <img v-if="!isItemPicture(itemIndex)"
                  :data-src="getItemSrc(itemIndex)"
                  :data-srcset="getItemSrcSet(itemIndex)"
                  :data-sizes="getItemSizes(itemIndex)"
                  :key="itemIndex"
                  draggable="false"
                  :alt="getItemAlt(itemIndex)"

                  @load="imageLoaded"
                  />
                <picture :key="itemIndex" v-else>
                  <source
                      v-for="(source, sourceIndex) in getPictureSources(itemIndex)"
                      :data-srcset="source.srcset"
                      :data-media="source.media"
                      :type="source.type"
                      :data-sizes="source.sizes || getItemSizes(imgIndex)"
                      :key="`source-${imgIndex}-${sourceIndex}`"
                  >
                  <img
                      :data-src="getItemSrc(itemIndex)"
                      :data-srcset="getItemSrcSet(itemIndex)"
                      :data-sizes="getItemSizes(itemIndex)"
                      draggable="false"
                      :alt="getItemAlt(itemIndex)"

                      @load="imageLoaded"
                  />
                </picture>
                
                <div v-show="imageLoading" class="cool-lightbox-loading-wrapper">
                  <slot name="loading">
                    <div class="cool-lightbox-loading"></div>
                  </slot>
                </div>
                <!--/loading-wrapper-->
              </div>
              <!--/imgs-slide-->
            
              <div v-else key="video" class="cool-lightbox__iframe">
                <iframe
                  class="cool-lightbox-video" 
                  v-autoplayObserver
                  :data-autoplay="setAutoplay(itemIndex)"
                  :src="getVideoUrl(getItemSrc(itemIndex))" 
                  v-if="(!checkIsMp4(getItemSrc(itemIndex)) && getMediaType(itemIndex) === 'video')"
                  :key="itemIndex"
                  style="width: 100%;max-height: 70vh;"
                  frameborder="0" 
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>

                <iframe
                  class="cool-lightbox-pdf" 
                  :src="getItemSrc(itemIndex)" 
                  v-if="(getMediaType(itemIndex) === 'iframe') || (getPDFurl(getItemSrc(itemIndex)))" 
                  :key="itemIndex" 
                  frameborder="0" 
                  allowfullscreen>
                </iframe>

                <video 
                  v-autoplayObserver
                  :data-autoplay="setAutoplay(itemIndex)"
                  class="cool-lightbox-video" 
                  v-if="checkIsMp4(getItemSrc(itemIndex)) || getMediaType(itemIndex) === 'webVideo'" 
                  :key="checkIsMp4(getItemSrc(itemIndex))" 
                  controls="" 
                  style="width: 100%;max-height: 70vh;"
                  controlslist="nodownload" l
                  poster="">
                  <source :src="checkIsMp4(getItemSrc(itemIndex))" :type="'video/'+(getVideoExt(getItemSrc(itemIndex)) ? getVideoExt(getItemSrc(itemIndex)) : getExtFromItem(itemIndex))">
                  Sorry, your browser doesn't support embedded videos
                </video> 
              </div>
            </div>
            <!--/cool-lightbox__iframe-->
          </div>
          <!--/cool-lightbox__slide-->
        </div>
        <!--/cool-lightbox-wrapper-->
          
        <div v-if="effect === 'fade'" class="cool-lightbox__wrapper">
          <div 
            ref="items"
            class="cool-lightbox__slide cool-lightbox__slide--current"
          >
            <div style="margin-left: auto; margin-right: auto;">
              <transition name="cool-lightbox-slide-change" mode="out-in">
                <div v-if="getMediaType(imgIndex) === 'image'" key="image" :style="imgWrapperStyle" class="cool-lightbox__slide__img">
                  <transition name="cool-lightbox-slide-change" mode="out-in" v-if="!isItemPicture(imgIndex)">
                    <img
                        :src="getItemSrc(imgIndex)"
                        :srcset="getItemSrcSet(imgIndex)"
                        :sizes="getItemSizes(imgIndex)"
                        :key="imgIndex"
                        draggable="false"
                        :alt="getItemAlt(imgIndex)"

                        @load="imageLoaded"
                    />
                  </transition>
                  <transition v-else name="cool-lightbox-slide-change" mode="out-in">
                    <picture :key="imgIndex">
                      <source
                          v-for="(source, sourceIndex) in getPictureSources(imgIndex)"
                          :srcset="source.srcset"
                          :type="source.type"
                          :media="source.media"
                          :sizes="source.sizes || getItemSizes(imgIndex)"
                          :key="`source-${imgIndex}-${sourceIndex}`"
                      >
                      <img
                          :src="getItemSrc(imgIndex)"
                          :srcset="getItemSrcSet(imgIndex)"
                          :sizes="getItemSizes(imgIndex)"
                          draggable="false"
                          :alt="getItemAlt(imgIndex)"

                          @load="imageLoaded"
                      />
                    </picture>
                  </transition>

                  
                  <div v-show="imageLoading" class="cool-lightbox-loading-wrapper">
                    <slot name="loading">
                      <div class="cool-lightbox-loading"></div>
                    </slot>
                  </div>
                  <!--/loading-wrapper-->
                </div>
                <!--/imgs-slide-->
              
                <div v-else key="video" class="cool-lightbox__iframe">
                  <transition name="cool-lightbox-slide-change" mode="out-in">
                    <iframe
                      class="cool-lightbox-video" 
                      v-autoplayObserver
                      :data-autoplay="setAutoplay(imgIndex)"
                      :src="getVideoUrl(getItemSrc(imgIndex))" 
                      v-if="(!checkIsMp4(getItemSrc(imgIndex)) && getMediaType(imgIndex) === 'video')"
                      :key="getVideoUrl(getItemSrc(imgIndex))" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                      style="width: 100%;max-height: 70vh;"
                      allowfullscreen>
                    </iframe>

                    <iframe
                      class="cool-lightbox-pdf" 
                      :src="getItemSrc(imgIndex)" 
                      v-if="(getMediaType(imgIndex) === 'iframe') || (getPDFurl(getItemSrc(imgIndex)))"
                      :key="imgIndex" 
                      frameborder="0" 
                      allowfullscreen>
                    </iframe>

                    <video class="cool-lightbox-video" 
                      v-autoplayObserver
                      :data-autoplay="setAutoplay(imgIndex)"
                      v-if="checkIsMp4(getItemSrc(imgIndex)) || getMediaType(imgIndex) === 'webVideo'" 
                      :key="checkIsMp4(getItemSrc(imgIndex))" 
                      controls="" 
                      controlslist="nodownload" 
                      style="width: 100%;max-height: 70vh;"
                      poster="">
                      <source :src="checkIsMp4(getItemSrc(imgIndex))" :type="'video/'+(getVideoExt(getItemSrc(imgIndex)) ? getVideoExt(getItemSrc(imgIndex)) : getExtFromItem(imgIndex))">
                      Sorry, your browser doesn't support embedded videos
                    </video> 
                  </transition>
                </div>
                <!--/cool-lightbox__iframe-->

              </transition>
            </div>
          </div>
          <!--/cool-lightbox__slide-->
        </div>
        <!--/cool-lightbox__wrapper-->

        <transition name="cool-lightbox-modal">
          <div v-show="checkIfIsObject(imgIndex) && (items[imgIndex].title || items[imgIndex].description)" key="caption-block" class="cool-lightbox-caption">
            <transition name="cool-lightbox-slide-change" mode="out-in">
              <h6 key="title" v-html="items[imgIndex].title" v-if="checkIfIsObject(imgIndex) && items[imgIndex].title"></h6>
            </transition>

            <transition name="cool-lightbox-slide-change" mode="out-in">
              <p key="description" v-html="items[imgIndex].description" v-if="checkIfIsObject(imgIndex) && items[imgIndex].description"></p>
            </transition>
          </div>
          <!--/cool-lightbox-caption-->
        </transition>
        
        <div class="cool-lightbox-toolbar" :class="buttonsClasses">

          <button type="button" @click="Download()" title="Download" class="cool-lightbox-toolbar__btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17.064,4.656l-2.05-2.035C14.936,2.544,14.831,2.5,14.721,2.5H3.854c-0.229,0-0.417,0.188-0.417,0.417v14.167c0,0.229,0.188,0.417,0.417,0.417h12.917c0.229,0,0.416-0.188,0.416-0.417V4.952C17.188,4.84,17.144,4.733,17.064,4.656M6.354,3.333h7.917V10H6.354V3.333z M16.354,16.667H4.271V3.333h1.25v7.083c0,0.229,0.188,0.417,0.417,0.417h8.75c0.229,0,0.416-0.188,0.416-0.417V3.886l1.25,1.239V16.667z M13.402,4.688v3.958c0,0.229-0.186,0.417-0.417,0.417c-0.229,0-0.417-0.188-0.417-0.417V4.688c0-0.229,0.188-0.417,0.417-0.417C13.217,4.271,13.402,4.458,13.402,4.688"></path>
            </svg>
          </button>
          <button type="button" @click="Delete()" title="Download" class="cool-lightbox-toolbar__btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"></path>
            </svg>
          </button>
          
          <button type="button" v-if="fullScreen" @click="toggleFullScreenMode" class="cool-lightbox-toolbar__btn" title="Fullscreen">
            <svg width="20px" height="20px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"></path>
            </svg>
          </button>

          <button type="button" v-if="showCloseButton" class="cool-lightbox-toolbar__btn" title="Close" @click="close">
            <slot name="close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"></path>
              </svg>
            </slot>
          </button>
        </div>
        <!--/cool-lightbox--toolbar-->
      </div>
      <!--/cool-lightbox-inner-->


      <transition name="cool-lightbox-modal">
        <div v-if="isZooming && useZoomBar" class="cool-lightbox-zoom">
          <svg height="469pt" class="cool-lightbox-zoom__icon" viewBox="0 -192 469.33333 469" width="469pt" 
            xmlns="http://www.w3.org/2000/svg"><path d="m437.332031.167969h-405.332031c-17.664062 
            0-32 14.335937-32 32v21.332031c0 17.664062 14.335938 32 32 32h405.332031c17.664063 0 32-14.335938 
            32-32v-21.332031c0-17.664063-14.335937-32-32-32zm0 0"/>
          </svg>
          <input type="range" v-model="zoomBar" name="points" min="0" max="50" />
          <svg height="426.66667pt" class="cool-lightbox-zoom__icon" viewBox="0 0 426.66667 426.66667" width="426.66667pt" xmlns="http://www.w3.org/2000/svg">
            <path d="m405.332031 192h-170.664062v-170.667969c0-11.773437-9.558594-21.332031-21.335938-21.332031-11.773437 0-21.332031 
            9.558594-21.332031 21.332031v170.667969h-170.667969c-11.773437 0-21.332031 9.558594-21.332031 21.332031 0 
            11.777344 9.558594 21.335938 21.332031 21.335938h170.667969v170.664062c0 11.777344 9.558594 21.335938 21.332031 
            21.335938 11.777344 0 21.335938-9.558594 21.335938-21.335938v-170.664062h170.664062c11.777344 0 21.335938-9.558594 
            21.335938-21.335938 0-11.773437-9.558594-21.332031-21.335938-21.332031zm0 0"/>
          </svg>
        </div>
      </transition>

    </div>
    <!--/cool-lightbox-->
  </transition>
  <!--/transition-->
</template>

<script>
import LazyLoadDirective from "../directives/LazyLoad";
import AutoplayObserver from "../directives/AutoplayObserver";
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import axios from "axios";

export default {
  directives: {
    lazyload: LazyLoadDirective,
    autoplayObserver: AutoplayObserver,
  },

  data() {
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

    showThumbs(prev, val) {
      let widthGalleryBlock = 212;
      let swipeAnimation = 'all .3s ease'
      if(window.innerWidth < 767) {
        widthGalleryBlock = 102
        swipeAnimation = null
      }

      if (this.thumbsPosition === 'bottom') {
        widthGalleryBlock = 0;
      }

      const self = this
      this.swipeAnimation = swipeAnimation

      if(prev) {

        if(this.dir === 'rtl') {
          this.xSwipeWrapper = this.imgIndex*(window.innerWidth - widthGalleryBlock) + 30*this.imgIndex
        } else {
          this.xSwipeWrapper = -this.imgIndex*(window.innerWidth - widthGalleryBlock) - 30*this.imgIndex
        }

      } else {
        
        if(this.dir === 'rtl') {
          this.xSwipeWrapper = this.imgIndex*window.innerWidth + 30*this.imgIndex
        } else {
          this.xSwipeWrapper = -this.imgIndex*window.innerWidth - 30*this.imgIndex
        }

      }

      setTimeout(function() {
        self.swipeAnimation = null
      }, 300)
    },

    index(prev, val) {
      const self = this
      
      // body scroll lock
      const $body = document.querySelector('body');

      if(prev !== null) {
        
        // swipe type
        this.swipeType = null
        this.initialMouseY = 0
        this.ySwipeWrapper = 0
        
        // set loop from data
        this.loopData = this.loop

        // swipe effect case remove loop
        if(this.effect === 'swipe') {
          this.loopData = false
          window.addEventListener('resize', this.xPositionOnResize)
        }

        // add img index
        this.imgIndex = prev
        this.isVisible = true

        // add events listener
        window.addEventListener('keydown', this.eventListener)

        // add wheel event
        if(this.enableWheelEvent) {
          window.addEventListener('wheel', this.wheelEvent)
        }
        
        // only in mobile
        if(window.innerWidth < 700) {

          // add click event
          setTimeout(function() {
            window.addEventListener('click', self.showButtons)
          }, 200)
        }

        if (this.enableScrollLock) {
          setTimeout(function() {
            self.setCompensateForScrollbar();
            disableBodyScroll(self.$refs.coolLightbox);
          }, 50);
        }

      } else {

        // hide and stop slideshow
        this.isVisible = false
        this.stopSlideShow()

        // set starts X to 0
        this.startsX = 0
        this.initialMouseY = 0
        this.swipeType = null

        // clear interval
        clearInterval(this.swipeInterval)
        this.swipeAnimation = null

        // finish swipe
        this.isDraggingSwipe = false
        this.isZooming = true

        // remove events listener
        window.removeEventListener('keydown', this.eventListener)

        if (this.enableScrollLock) {
          self.removeCompensateForScrollbar();
          enableBodyScroll(self.$refs.coolLightbox);
        }

        // remove click event
        window.removeEventListener('click', this.showButtons)

        // remove resize event
        window.removeEventListener('resize', this.xPositionOnResize)
        
        // remove wheel event
        if(this.enableWheelEvent) {
          window.removeEventListener('wheel', this.wheelEvent)
        }
      }

    }, 
    
    imgIndex(prev, val) {
      const thisContext = this
      
      // when animation is loaded
      this.$nextTick(() => {

        if(this.effect === 'swipe') {
          this.setLightboxInnerWidth()
          this.setXPosition(prev)
        }
        
        if(prev !== null & val === null) {
          this.$emit("on-open", prev);
        }

        if(prev !== null) {
          if(prev !== val) {
            if(!this.getYoutubeUrl(this.getItemSrc(prev)) && !this.getVimeoUrl(this.getItemSrc(prev))) {
              this.stopVideos();
            }
          }

          // if is an image change imageLoading to true
          if(!this.getVideoUrl(this.getItemSrc(prev))) {
            if(!this.is_cached(this.getItemSrc(prev))) {
              this.imageLoading = true
            }
          }

          // add caption padding to Lightbox wrapper
          this.addCaptionPadding()
          
        }

      })
    }, 
  },

  beforeDestroy () {
    if (this.enableScrollLock) {
      this.removeCompensateForScrollbar();
      if(this.$refs.coolLightbox) {
        enableBodyScroll(this.$refs.coolLightbox);
      }
    }
  },

  methods: {
    Download() {
      let imageSrc = this.getItemSrc(this.imgIndex)
      imageSrc = imageSrc.replace('size=small', '').replace('size=medium','')
      axios.get(imageSrc, {
        withCredentials: true,
        responseType: 'blob'
      }).then(response => {
          var reader = new window.FileReader();
          reader.readAsDataURL(response.data); 
          reader.onload = function() {
            var imageDataUrl = reader.result;
            console.log(imageDataUrl)
            const link = document.createElement('a')
            link.href = imageDataUrl
            console.log(response.headers)
            link.download = response.headers['x-file-name']
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
      })
    },
    Delete() {
      let imageSrc = this.getItemSrc(this.imgIndex)
      imageSrc = imageSrc.replace('size=small', '').replace('size=medium','')
      axios.delete(imageSrc, {
        withCredentials: true,
      }).then(response => {
        this.close()
      })
    },
    getExtFromItem(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      if(this.checkIfIsObject(imgIndex)) {
        const item = this.items[imgIndex]

        //item extension is specified, so return it
        if (item['ext']) {
          return item['ext']
        }

        return 'mp4';
      }
    },

    stopVideos() {
      const videos = document.getElementsByClassName("cool-lightbox-video");
      const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
      if(videos.length > 0) {
        Array.prototype.forEach.call(videos, video => {
          const type = video.tagName;
          
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

    removeCompensateForScrollbar() {
      document.body.classList.remove("compensate-for-scrollbar");
      const noscrollStyle = document.getElementById("coollightbox-style-noscroll");
      if(noscrollStyle !== null) {
        document.getElementById("coollightbox-style-noscroll").remove();
      }
    },

    setCompensateForScrollbar() {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

    setAutoplay(itemIndex) {
      if(this.checkIfIsObject(itemIndex) && this.items[itemIndex].hasOwnProperty('autoplay') && this.items[itemIndex].autoplay) {
        return true;
      }

      return false;
    },

    toggleFullScreenMode() {
      if(this.isFullScreenMode) {
        this.closeFullscreen()
      } else {
        this.fullScreenMode()
      }

      this.isFullScreenMode = !this.isFullScreenMode
    },

    closeFullscreen() {
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

    fullScreenMode() {
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
    checkIfIsButton(event) {
      var elements = '.cool-lightbox__iframe *, .cool-lightbox-button, .cool-lightbox-button *, .cool-lightbox-toolbar__btn, .cool-lightbox-toolbar__btn *, .cool-lightbox-caption h6, .cool-lightbox-caption p, .cool-lightbox-caption a';
      if (event.target.matches(elements)) {
        return true
      }

      return false
    },

    // check if the image is cached
    is_cached(src) {
      var image = new Image();
      image.src = src;

      return image.complete;
    },

    // image loaded event
    imageLoaded() {
      this.imageLoading = false
    },

    // get video url
    itemThumb(itemUrl, itemIndex) {

      var thumb = this.getItemThumb(itemIndex)
      if(thumb) {
        return thumb
      }

      var youtubeID = this.getYoutubeID(itemUrl)
      if(youtubeID) {
        return 'https://img.youtube.com/vi/'+youtubeID+'/mqdefault.jpg'
      }

      var vimeoID = this.getVimeoID(itemUrl)
      if(vimeoID) {
        return false
      }

      return itemUrl
    },

    isItemPicture(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item.picture
      }

      return false
    },

    getPictureSources(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const picture = this.items[imgIndex].picture

      return picture.sources ? picture.sources : []
    },
    
    // get item src
    getItemSrc(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcName]
      }

      return item
    },

    getItemSrcSet(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcSetName]
      }

      return null
    },

    getItemSizes(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item.sizes
      }

      return null
    },
    
    getItemAlt(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item.alt;
      }

      return null
    },

    getItemThumb(imgIndex) {
      if(imgIndex === null) {
        return false
      }

      const item = this.items[imgIndex]
      if(this.checkIfIsObject(imgIndex)) {
        return item[this.srcThumb]
      } 

      if(this.getVideoUrl(item)) {
        return false
      }

      return item
    },

    // get item media type
    getMediaType(imgIndex) {
      if(imgIndex === null) {
        return false
      }
      
      if(this.checkIfIsObject(imgIndex)) {
        
        const item = this.items[imgIndex]

        //item type is specified, so return it
        if (item[this.srcMediaType]) {
          return item[this.srcMediaType]
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

      return item
    },

    // toggle play slideshow event
    togglePlaySlideshow() {
      if(!this.slideshow) {
        return false
      }

      if(!this.hasNext && !this.loopData) {
        return false
      }
      this.isPlayingSlideShow = !this.isPlayingSlideShow

      // if is playing move if not stop it
      if(this.isPlayingSlideShow) {
        this.move()
      } else {
        this.stopSlideShow()
      }
    },

    // stop slideshow
    stopSlideShow() {
      this.isPlayingSlideShow = false
      clearInterval(this.intervalProgress);
      this.stylesInterval = {
        'transform': 'scaleX(0)',
        'transition': 'none',
      }
    },

    // move event in zoom
    move() {
      const self = this
      this.progressWidth = 100;
      this.intervalProgress = setInterval(frame, this.slideshowDuration + 90);
      
      self.stylesInterval = {
        'transform': 'scaleX(1)',
        'background': this.slideshowColorBar,
        'transition-duration': this.slideshowDuration+'ms',
      }
      function frame() {
        self.stylesInterval = {
          'transform': 'scaleX(0)',
          'transition': 'none',
        }
        
        if(self.dir === 'rtl') {
          self.onPrevClick(true)
        } else {
          self.onNextClick(true)
        }

        if(!self.hasNext && !self.loopData) {
          self.stopSlideShow()
        } else {
          setTimeout(function() {
            self.stylesInterval = {
              'transform': 'scaleX(1)',
              'background': self.slideshowColorBar,
              'transition-duration': self.slideshowDuration+'ms',
            }
          }, 50)
        }
      }
    }, 

    // show buttons event
    showButtons(event) {
      if (!this.checkIfIsButton(event)) {
        const self = this
        setTimeout(function() {
          self.buttonsVisible = !self.buttonsVisible
        }, 100)
      }
    },

    // check if is allowed to drag
    checkMouseEventPropButton(button) {
      if (!this.isZooming) return false
      // mouse left btn click
      return button === 0
    },
  
    // close event
    close() {
      this.stopSlideShow();
      this.$emit("close", this.imgIndex);
      this.showThumbs = false;
      this.imgIndex = null;
    },

    wheelEvent(event) {
      const delay = 350;
      const currentTime = new Date().getTime();
      let direction = event.deltaY > 0 ? 'top' : 'down';

      if (currentTime - this.prevTime < delay) return;

      this.prevTime = currentTime;

      switch (direction) {
        case 'top':
          return this.changeIndexToPrev();
          break;
        case 'down':
          return this.changeIndexToNext();
      }
    },

    // close event click outside
    closeModal(event) {
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
        this.close()
      }
    },

    // next slide event
    onNextClick(isFromSlideshow = false) {
      if(this.isZooming) {
        return false;
      }

      if(!isFromSlideshow) {
        this.stopSlideShow()
      }


      if(this.dir === 'rtl') {
        return this.changeIndexToPrev();
      }

      this.changeIndexToNext()
    },

    // prev slide event
    onPrevClick(isFromSlideshow = false) {
      if(this.isZooming) {
        return false;
      }
      
      if(!isFromSlideshow) {
        this.stopSlideShow()
      }
      
      if(this.dir === 'rtl') {
        return this.changeIndexToNext();
      }

      this.changeIndexToPrev();
    },

    // change to next index
    changeIndexToNext() {
      if(this.hasNext) {
        this.onIndexChange(this.imgIndex + 1)
      } else {
        // only if has loop prop
        if(this.loopData) {
          this.onIndexChange(0)
        }
      }
    },

    // change to prev index
    changeIndexToPrev() {
      if(this.hasPrevious) {
        this.onIndexChange(this.imgIndex - 1)
      } else {
        // only if has loop prop
        if(this.loopData) {
          this.onIndexChange(this.items.length - 1)
        }
      }
    },

    // set lightbox inner width
    setLightboxInnerWidth() {
      let el = document.getElementsByClassName('cool-lightbox__inner');
      let width = el[0].clientWidth
      this.lightboxInnerWidth = width
    },

    // x position on resize event
    xPositionOnResize() {
      this.setLightboxInnerWidth()
      const index = this.imgIndex

      if(this.dir === 'rtl') {
        this.xSwipeWrapper = index*this.lightboxInnerWidth+30*index
        return;
      }

      // set x position
      this.xSwipeWrapper = -index*this.lightboxInnerWidth-30*index
    },

    // set x position by img index
    setXPosition(index) {
      if(this.dir === 'rtl') {
        this.xSwipeWrapper = index*this.lightboxInnerWidth+30*index
        return
      }

      // set x position
      this.xSwipeWrapper = -index*this.lightboxInnerWidth-30*index
      return; 
    },

    // index change
    onIndexChange(index) {
      const self = this;
      this.imgIndex = index;
      this.$emit('on-change', index);

      setTimeout(function() {
        self.$emit('on-change-end', index);
      }, 400);
    },

    // caption size 
    addCaptionPadding() {
      if(this.checkIfIsObject(this.imgIndex) && (this.items[this.imgIndex].title || this.items[this.imgIndex].descripcion)) {
        const el = document.getElementsByClassName('cool-lightbox-caption');
        if(el.length > 0) {
          this.paddingBottom = el[0].offsetHeight
        } 
      } else {
        this.paddingBottom = 60
      }
    },

    getPDFurl(url) {
      if(this.imgIndex === null) {
        return false
      }

      const str = new String(url);
      if(str.endsWith('.pdf')){
        return url
      }

      return false
    },

    // check if is video
    getVideoUrl(itemSrc) {

      const mp4Url = this.checkIsMp4(itemSrc)
      if(mp4Url) {
        return mp4Url
      }

      return false
    },
    
    // getYoutube ID
    getYoutubeID(url) {
      return false
    },

    // get youtube url
    getYoutubeUrl(url) {

      // youtube data
      const ytId = this.getYoutubeID(url)

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
    getVimeoID(url) {
      
      return false
    },

    // get vimeo url
    getVimeoUrl(url) {

      return false
    },

    // check if video is mp4
    checkIsMp4(url) {
      if(this.imgIndex === null) {
        return false
      }

      const str = new String(url);
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
    getVideoExt(url) {
      if(this.imgIndex === null) {
        return false
      }

      const str = new String(url);
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
    checkIfIsObject(itemIndex) {
      const item = this.items[itemIndex]
      if(typeof item === 'object' && item !== null) {
        return true
      }
      return false;
    },

    // arrows and escape events
    eventListener(e) {
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
    imgWrapperStyle() {
      return {
        top: `50%`,
        left: `50%`,
        transition: this.transition,
      }
    },

    // lightbox styles
    lightboxStyles() {
      return { 
        'z-index': this.zIndex,
        'background-color': this.overlayColor,
      }
    },

    innerStyles() {
      return {
        'padding-bottom': this.paddingBottom+'px',
      }
    },

    // get item src
    itemSrc() {
      if(this.imgIndex === null) {
        return false
      }

      const item = this.items[this.imgIndex]
      if(this.checkIfIsObject(this.imgIndex)) {
        return item[this.srcName]
      }

      return item
    },

    // Lightbox classes
    lightboxClasses() {
      let classesReturn = [
        { 'cool-lightbox--can-zoom': this.canZoom && !this.disableZoom },
        { 'cool-lightbox--zoom-disabled': this.disableZoom},
        { 'cool-lightbox--is-zooming': this.isZooming },
        { 'cool-lightbox--show-thumbs': this.showThumbs },
        { 'cool-lightbox--is-swipping': this.isDraggingSwipe }
      ];

      let classString = 'cool-lightbox--thumbs-'+this.thumbsPosition
      classesReturn.push(classString)

      return classesReturn
    },

    // Buttons classes
    buttonsClasses() {
      return {
        'hidden': !this.buttonsVisible,
      }
    },

    // check if the slide has next element
    hasNextButton() {
      if(this.dir === 'rtl') {
        return (this.imgIndex - 1 >= 0)
      }
        
      return (this.imgIndex + 1 < this.items.length)
    },

    // check if the slide has previous element 
    hasPreviousButton() {
      if(this.dir === 'rtl') {
        return (this.imgIndex + 1 < this.items.length)
      }

      return (this.imgIndex - 1 >= 0)
    },

    // check if the slide has next element
    hasNext() {
      return (this.imgIndex + 1 < this.items.length)
    },

    // check if the slide has previous element 
    hasPrevious() {
      return (this.imgIndex - 1 >= 0)
    },
  },
  mounted() {
    console.log('Init Cool Lightbox! V2.3')
  },
};
</script>

<style lang="scss">
// A map of breakpoints.
$breakpoints: (
  phone-sm: 420px,
  phone: 767px,
  tablet-lg: 1024px,
  desktop: 1202px
);

// Breakpoints SCSS
@mixin breakpoint($breakpoint) {

  // If the breakpoint exists in the map.
	@if map-has-key($breakpoints, $breakpoint) {
	
    // Get the breakpoint value.
    $breakpoint-value: map-get($breakpoints, $breakpoint);
	
	  //Build the media query
		@media (min-width: $breakpoint-value) {
			@content;
		}
	} 
}

.cool-lightbox {
  position: fixed; 
  left: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 0;
  transition: all .3s ease;
  .cool-lightbox-zoom {
    position: absolute;
    bottom: 15px;
    left: 50%;
    display: flex;
    z-index: 99999;
    background-color: rgba(15, 15, 15, 0.8);
    border-radius: 8px;
    padding: 0px 12px;
    align-items: center;
    transform: translateX(-50%);
    input[type=range] {
      -webkit-appearance: none;
      margin: 10px 0;
      width: 105px;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 0px 0px 0px #000000;
      background: #e6e6e6;
      border-radius: 11px;
      border: 0px solid #000000;
    }
    input[type=range]::-webkit-slider-thumb {
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #000000;
      height: 12px;
      width: 12px;
      border-radius: 13px;
      background: #ffffff;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -4.5px;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
      background: #e6e6e6;
    }
    input[type=range]::-moz-range-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 0px 0px 0px #000000;
      background: #e6e6e6;
      border-radius: 11px;
      border: 0px solid #000000;
    }
    input[type=range]::-moz-range-thumb {
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #000000;
      height: 12px;
      width: 12px;
      border-radius: 13px;
      background: #ffffff;
      cursor: pointer;
    }
    input[type=range]::-ms-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      animate: 0.2s;
      background: transparent;
      border-color: transparent;
      color: transparent;
    }
    input[type=range]::-ms-fill-lower {
      background: #e6e6e6;
      border: 0px solid #000000;
      border-radius: 22px;
      box-shadow: 0px 0px 0px #000000;
    }
    input[type=range]::-ms-fill-upper {
      background: #e6e6e6;
      border: 0px solid #000000;
      border-radius: 22px;
      box-shadow: 0px 0px 0px #000000;
    }
    input[type=range]::-ms-thumb {
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #000000;
      height: 12px;
      width: 12px;
      border-radius: 13px;
      background: #ffffff;
      cursor: pointer;
    }
    input[type=range]:focus::-ms-fill-lower {
      background: #e6e6e6;
    }
    input[type=range]:focus::-ms-fill-upper {
      background: #e6e6e6;
    }
    .cool-lightbox-zoom__icon {
      height: 15px;
      width: 15px;
      color: #FFF;
      &:first-of-type {
        margin-right: 10px;
      }
      &:last-of-type {
        margin-left: 10px;
      }
    }
  }
  .cool-lightbox-thumbs {
    position: absolute;
    height: 100vh;
    overflow-y: auto;
    width: 102px;
    right: -102px;
    top: 0;
    overflow-x: hidden;
    transition: none;
    background-color: #ddd;
    scrollbar-width: thin;
    scrollbar-color: #fa4242 rgba(175, 175, 175, 0.9);
    @include breakpoint(phone) {
      transition: all .3s ease;
    }
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-button {
      width: 0px;
      height: 0px;
    }
    &::-webkit-scrollbar-thumb {
      background: #fa4242;
      border: 0px none #ffffff;
      border-radius: 50px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #ffffff;
    }
    &::-webkit-scrollbar-thumb:active {
      background: #000000;
    }
    &::-webkit-scrollbar-track {
      background: #e1e1e1;
      border: 0px none #ffffff;
      border-radius: 8px;
    }
    &::-webkit-scrollbar-track:hover {
      background: #666666;
    }
    &::-webkit-scrollbar-track:active {
      background: #333333;
    }
    &::-webkit-scrollbar-corner {
      background: transparent;
    }
    @include breakpoint(phone) {
      width: 212px;
      right: -212px;
    }
    .cool-lightbox-thumbs__list {
      display: flex;
      flex-wrap: wrap;
      padding: 2px;
      padding-right: 0;
      .cool-lightbox__thumb {
        background-color: black;
        width: 100%;
        margin-right: 2px;
        margin-bottom: 2px;
        display: block;
        height: 75px;
        position: relative;
        @include breakpoint(phone) {
          width: calc(100%/2 - 2px);
        }
        &:before {
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          content: '';
          z-index: 150;
          transition: all .3s ease;
          position: absolute;
          visibility: hidden;
          border: 3px solid #fa4242;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        &.is-video {
          .cool-lightbox__thumb__icon {
            position: absolute;
            z-index: 100;
            top: 50%;
            left: 50%;
            width: 25px;
            height: 25px;
            transform: translate(-50%,-50%);
            path {
              fill: #FFF;
            }
          }
          &:after {
            content: '';
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 50;
            position: absolute;
            background: rgba(0,0,0, 0.6);
          }
        }
        &.active, &:hover {
          &:before {
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }
  }
  .cool-lightbox__inner {
    padding: 60px 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    transition: none;
    @include breakpoint(phone) {
      transition: all .3s ease;
    }
  }
  .cool-lightbox__progressbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 500;
    transform-origin: 0;
    transform: scaleX(0);
    transition: transform 3s linear;
    display: block;
  }
  &.cool-lightbox--is-swipping {
    cursor: -webkit-grabbing; 
    cursor: grabbing;
    iframe {
      pointer-events: none;
    }
    .cool-lightbox__slide {
      transition: none;
      &.cool-lightbox__slide--hide, &.cool-lightbox__slide--hide {
        display: flex;
        z-index: 50;
      }
    }
  }
  &.cool-lightbox--zoom-disabled {
    .cool-lightbox__slide {
      .cool-lightbox__slide__img {
        transform: translate3d(-50%, -50%, 0px);
      }
    }
  }
  &.cool-lightbox--can-zoom {
    .cool-lightbox__slide {
      img {
        cursor: zoom-in;
      }
    }
  }
  &.cool-lightbox--is-zooming {
    .cool-lightbox__slide {
      img {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab; 
      }
    }
    .cool-lightbox-caption {
      opacity: 0;
    }
  }
  &.cool-lightbox--thumbs-right {
    &.cool-lightbox--show-thumbs {
      .cool-lightbox__inner {
        right: 102px;
        @include breakpoint(phone) {
          right: 212px;
        }
      }
      .cool-lightbox-thumbs {
        right: 0;
      }
    }
  }
  &.cool-lightbox--thumbs-bottom {
    .cool-lightbox-thumbs {
      width: 100%;
      left: 0;
      right: 0;
      top: auto;
      height: 70px;
      bottom: -70px;
      overflow: auto;
      @include breakpoint(phone) {
        bottom: -79px;
        height: 79px;
      }
      .cool-lightbox-thumbs__list {
        width: 100%;
        flex-wrap: nowrap;
        justify-content: center;
        .cool-lightbox__thumb {
          width: 100px;
          flex-shrink: 0;
          margin-bottom: 0;
          height: 65px;
          @include breakpoint(phone) {
            height: 75px;
          }
        }
      }
    }
    &.cool-lightbox--show-thumbs {
      .cool-lightbox__inner {
        bottom: 70px;
        @include breakpoint(phone) {
          bottom: 79px;
        }
      }
      .cool-lightbox-thumbs {
        bottom: 0;
      }
    }
  }
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
  }
  svg {
    path, rect {
      fill: currentColor;
    }
  }
  .cool-lightbox-button {
    padding: 21px 16px 21px 4px;
    height: 100px;
    opacity: 1;
    z-index: 800;
    color: #ccc;
    transition: all .3s ease;
    position: absolute;
    top: calc(50% - 50px);
    width: 54px;
    transition: all .3s ease;
    visibility: visible;
    @include breakpoint(phone) {
      width: 70px;
      padding: 31px 26px 31px 6px;
    }
    &.hidden {
      opacity: 0;
      visibility: hidden;
    }
    &:hover {
      color: #fff;
    }
    > .cool-lightbox-button__icon {
      padding: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(30,30,30,.6);
      > svg {
        width: 100%;
        height: 100%;
      }
    }
    &.cool-lightbox-button--prev {
      left: 0;
    }
    &.cool-lightbox-button--next {
      right: 0;
      padding: 21px 4px 21px 16px;
      @include breakpoint(phone) {
        padding: 31px 6px 31px 26px;
      }
    }
  }
  .cool-lightbox-pdf {
    max-width: 100%;
  }
  .cool-lightbox__iframe {
    width: 100%;
    display: flex;
    top: 50%;
    left: 50%;
    align-items: center;
    justify-content: center;
    position: relative;
    transform: translate3d(-50%, -50%, 0px) scale3d(1, 1, 1);
    .cool-lightbox-video {
    }
    iframe {
      //position: absolute;
      width: 100%;
      height: 100%;
      @include breakpoint(phone) {
        max-width: 80vw;
        max-height: 80vh;
      }
    }
  }
  .cool-lightbox__wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    &.cool-lightbox__wrapper--swipe {
      display: flex;
      align-items: center;
      .cool-lightbox__slide {
        flex-shrink: 0;
        display: flex;
        position: relative;
        height: 100%;
        opacity: 0.4;
        transition: opacity .3s linear;
        &.cool-lightbox__slide--current {
          opacity: 1;
        }
      }
    }
  }
  .cool-lightbox__slide {
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: none;
    position: absolute;
    margin-right: 30px;
    &:last-of-type {
      margin-right: 0;
    }
    transition: transform .3s ease;
    &.cool-lightbox__slide--current {
      display: flex;
    }
    .cool-lightbox__slide__img {
      position: absolute;
      height: 100%;
      width: 100%;
      left: 50%;
      top: 50%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      transform: translate3d(-50%, -50%, 0px) scale3d(1, 1, 1);
      transition: all .3s ease;
      display: flex;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      margin: auto;
      z-index: 9999;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -ms-transform: translateZ(0);
      -webkit-transform: translateZ(0); 
      transform: translateZ(0);
      box-shadow: 0 0 1.5rem rgba(0,0,0,.45);
    }

    picture {
      display: flex;
      align-items: center;
      justify-content: center;
      max-height: 100%;
      height: 100%;
      margin: auto;
      z-index: 9999;
    }
  }
}

.cool-lightbox-toolbar {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 1;
  display: flex;
  transition: all .3s ease;
  visibility: visible;
  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
  .cool-lightbox-toolbar__btn {
    background: rgba(30,30,30,.6);
    border: 0;
    border-radius: 0;
    box-shadow: none;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    margin: 0;
    padding: 9px;
    position: relative;
    transition: color .2s;
    vertical-align: top;
    visibility: inherit;
    width: 40px;
    height: 40px;
    color: #ccc;
    @include breakpoint(phone) {
      width: 44px;
      height: 44px;
      padding: 10px;
    }
    > svg {
      width: 100%;
      height: 100%;
    }
    &:hover {
      color: #FFFFFF;
    }
  }
}

.cool-lightbox-caption {
  bottom: 0;
  color: #eee;
  font-size: 14px;
  font-weight: 400;
  left: 0;
  opacity: 1;
  line-height: 1.5;
  padding: 18px 28px 16px 24px;
  right: 0;
  text-align: center;
  direction: ltr;
  position: absolute;
  transition: opacity .25s ease,visibility 0s ease .25s;
  z-index: 99997;
  background: linear-gradient(0deg,rgba(0,0,0,.75) 0,rgba(0,0,0,.3) 50%,rgba(0,0,0,.15) 65%,rgba(0,0,0,.075) 75.5%,rgba(0,0,0,.037) 82.85%,rgba(0,0,0,.019) 88%,transparent);
  @include breakpoint(phone) {
    padding: 22px 30px 23px 30px;
  }
  a {
    color: #eee;
    text-decoration: underline;
  }
  h6 {
    font-size: 14px;
    margin: 0 0 6px 0;
    line-height: 130%;
    @include breakpoint(phone) {
      font-size: 16px;
      margin: 0 0 6px 0;
    }
  }
  p {
    font-size: 13px;
    line-height: 130%;
    color: #ccc;
    @include breakpoint(phone) {
      font-size: 15px;
    }
    a {
      color: #ccc;
      &:hover {
        color: #eee;
      }
    }
  }
}

.cool-lightbox-modal-enter-active, .cool-lightbox-modal-leave-active {
  transition: opacity .35s
}
.cool-lightbox-modal-enter, .cool-lightbox-modal-leave-to {
  opacity: 0
}

.cool-lightbox-slide-change-enter-active, .cool-lightbox-slide-change-leave-active {
  transition: opacity 0.27s;
}

.cool-lightbox-slide-change-enter, .cool-lightbox-slide-change-leave-to  {
  opacity: 0;
}

.cool-lightbox-loading-wrapper {
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  .cool-lightbox-loading {
    animation: cool-lightbox-rotate 1s linear infinite;
    background: transparent;
    border: 4px solid #888;
    border-bottom-color: #fff;
    border-radius: 50%;
    height: 50px;
    opacity: .7;
    padding: 0;
    width: 50px;
    z-index: 500;
  }
}

@keyframes cool-lightbox-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>