// show a message to the user
function showmessage(msg) {
    if ($('main').children('p').length > 0 ) {
    	$('main > p').html(msg);
    } else {
    	$('main').prepend('<p>'+msg+'</p>');		
    }
}

// remove message
function removemessage() {
    $('main p').remove();
}

// invert background color
function invertBG() {
	$('body').toggleClass('inv');
	localStorage.setItem('MARKbg', $('body').attr('class'));	
}


// here we go
$(document).ready(function(){
    imgdir = $('body').data('imgdir');
    images = $('main ul li');
    loaded = 0;
    hidden = null;
    thumbBreakpoint = 600;
    activeFilter = '*';
    filetypes = new Array('image/jpeg', 'image/png', 'image/gif');
    unsortedmsg = 'No unsorted images.'

    // hide things, including images until sorted
    $('aside, aside #done, aside #close, main ul').hide();
    
    // focus login form
    $('form input').first().focus();
    
    // get image size from local storage
    if (localStorage.getItem('MARKsz') === null) {
    	// set image size to default value
    	sz = parseInt(images.css('width'));
    } else {
    	// set image size to stored value
    	sz = localStorage.getItem('MARKsz');
    		images.css('width',localStorage.getItem('MARKsz')+'px');
    }
    
    // get background color from local storage
    if (localStorage.getItem('MARKbg') != null) {
        $('body').addClass(localStorage.getItem('MARKbg'));
    }
    
    // if set, get active filter from local storage
    if (localStorage.getItem('MARKfilter') != null) {
        activeFilter = localStorage.getItem('MARKfilter');

        switch (activeFilter) {
        case '*':
            setActive = $('nav ol li').first();
            break;
        case '.imgs':
            setActive = $('nav ol li').last();
            break;
        default:
            setActive = $('nav ol li:contains('+activeFilter.substr(1)+')');          
        }
        
        setActive.addClass('active');
    }
   
    // dodgy, magic-number method to load full-sized images if thumbnails are set to a big size
    if (sz >= thumbBreakpoint) {
    	images.each(function(){
    		$(this).find('figure a img').attr('src',$(this).data('url'));
    	});
    }
    
    setImageHeights();
    
    marked = $('main ul').isotope({
    	itemSelector: 'main ul li',
    	masonry: {
    		gutter: 40
    	},
    	filter: activeFilter
    }, $('main ul').fadeIn(100));
    
    if (activeFilter == '.imgs' && $(activeFilter).length == 0) {
        showmessage(unsortedmsg);
    }
    
    initLazyLoad();
    
    // -----------------------------------------------------------------------------------------
        
    // keyboard controls to adjust image size and invert background color
    $(window).keydown(function(e) {	
      
      	var colwidth = parseInt(images.css('width'));
      	var mult = .3; // image resize multiplier for each keypress
      
      	// + for bigger thumbnails
        if (e.keyCode === 187) {
    		images.css('width', colwidth+colwidth*mult+'px');

    		if (colwidth+colwidth*mult >= thumbBreakpoint) {
    			images.each(function(){
    				$(this).find('figure a img').attr('src',$(this).data('url'));
    			});						
    		}

            setImageHeights();
    		marked.isotope('layout');
    		localStorage.setItem('MARKsz',colwidth+colwidth*mult);
    
    	// - for smaller thumbnails
        } else if (e.keyCode === 189) {
    		images.css('width', colwidth-colwidth*mult+'px');
            
    		if (colwidth-colwidth*mult < thumbBreakpoint) {
    			images.each(function(){
    				$(this).find('figure a img').attr('src',$(this).data('thumb'));
    			});						
    		}
    		
    		setImageHeights();
    		marked.isotope('layout');
    		localStorage.setItem('MARKsz', colwidth-colwidth*mult)

    	// i (to invert background color)
        } else if (e.keyCode === 73) {
			invertBG();
        }
    });

    // remove selections by clicking in white space
    $(document).click(function(e){
    	
    	if (!$(e.target).closest('li').length) {
    		hideFilter();
    	} else {
    		
    		el = $(e.target).closest('li');

            // shift-click images to mark them
    		if (e.shiftKey) {
    					
    			e.preventDefault();
    			
    			// mark clicked image as selected
    			el.toggleClass('selected');
    			
    			// if at least one image is selected, show sidebar
    			if ($('li.selected').length) {
                    showFilter(false);
    			} else {
                    hideFilter();
    			}
    		}
    	}
    });

    // set actual image heights, dependent on current user setting and screen resolution    
    function setImageHeights() {
        images.slice(0, 500).each(function(){
            var img = $(this).find('figure a img');        
            var liHeight = parseInt($(this).css('width'))*img.attr('height')/img.attr('width');
            
            $(this).css('height', liHeight);
        })        
    }
        
    // load further images on scroll
    function initLazyLoad() {
        wp = images.waypoint({
            handler: function(direction) {
                if (direction == 'down') {
                    el = this.element;
                    $(el).find('figure a img').not('.loaded')
                    .css('opacity','0')
                    .attr('src',$(el).data('thumb'))
                    .animate({
                        opacity: 1
                    }, 200)
                    .addClass('loaded');
                }
        },
            context: window,
            offset: Waypoint.viewportHeight()*0.8
        })      
    }    
    
    // show filter panel
    function showFilter(forceTouched) {
        
        if (!forceTouched) {
           // adjust main container width to sidebar width
           $('main').css({
               'max-width': $(window).width()-$('aside').outerWidth(),
               'margin': '60px 0 60px 0'
           });
        } else {
            $('aside #close').show();
        }
    
        $('header > nav').hide();
        
        // add leading 0
        n = $('li.selected').length;
        if ((n < 10)) {
            n = '0'+n
        }
        
        $('aside p > span').text(n);
        
        marked.isotope('layout');
        $('aside').show();        
    }
    
    
    // hide filter panel   
    function hideFilter() {

        // clear selected images
        if ($('li.selected').length) {
            $('li.selected').removeClass('selected');
        }
        			    	
        // reset main container width
        $('main').css({
            	'max-width': 'none',
            	'margin': '60px auto',
            });
            
        $('header > nav').show();
            
        marked.isotope('layout');
        $('aside').hide(); 
    }
    
    
    // add delete function to image
    function addDeleteFunction(btn) {
        btn.click(function(){

            var thumb = btn.next().find('img').attr('src');
    		var url = btn.next().find('a').attr('href');
    		            
    		// pass to delete helper
    		$.post('mark.php', {a: 'del', f: url, t: thumb});
    							
    		// remove image from view & rearrange layout
    		marked.isotope('remove', btn.parent()).isotope('layout');	
    	})        
    }   
     
    // move an image to a different folder
    function moveImage(target) {
				
				// get destination folder name
    		var folder = $(target).text();
    		
    		if (folder == $('aside ol li:first-child').text()) {
    			folder = '';
    		}
    				
    		// get selected images
    		var sel = $('main ul li.selected figure a img');
    
    		// pass to move helper
    		sel.each(function() {
        		
        	var item = $(this)
    			var thumb = $(this).attr('src');
    			var file = $(this).parent().attr('href');
    			var li = $(this).closest('li');
    			
    			$.post('mark.php', {a: 'move', f: file, t: thumb, d: folder}).done($.proxy(function(){  				

    				// determine new correct urls for image and thumb
    				if (li.attr('class').split(' ')[0] != 'imgs') { 
        				var pre = '';
    				} else {
        				var pre = 'imgs/';
    				}

            var newurl = li.data('url').replace(li.attr('class').split(' ')[0],pre+folder);
            li.data('url', newurl);
            var newthumb = li.data('thumb').replace(li.attr('class').split(' ')[0], pre+folder);
            li.data('thumb', newthumb);

    				// apply urls	
    				item.attr('src', li.data('thumb'));
    				item.parent().attr('href', li.data('url'));

    				// keep selection & add appropiate classes
    				if (li.hasClass('selected')) {
	    				var selection = true;
	    			}
    				
            li.removeClass().addClass(folder);
            
            // if no folder was selected, re-attach base class
            if (folder == '') {
	            li.addClass('imgs')
	          };
    			
            // if unsorted filter is applied and there are no unfiltered images
            if (activeFilter == '.imgs' && $(activeFilter).length == 0) {
            	showmessage(unsortedmsg);
            }
            
            // re-apply active filter
            marked.isotope({filter: activeFilter});
    				
    			}, target));    			
    		});    
    }
    
    // move images to folders, remove images from folders
    $('aside ol li').each(function(){
    	$(this).on('click touchend',function(e){
    		e.stopPropagation();
            moveImage($(this));
            $('aside #done').fadeIn(function(){
                if (e.type != 'click') {
                    hideFilter(); 
                }
            }).fadeOut();
        });
    })
    
    // manually hide folder selection on touch-based devices
    $('aside #close').click(function(){
      hideFilter();  
    })

    // force touch images on mobile to sort them into folder
    images.pressure({
      change: function(force, event){
        if (force > 0.5) { 
          event.preventDefault();            
            // mark clicked image as selected
            $(this).toggleClass('selected');
            showFilter(true);
        }    
      },
      unsupported: function(){
        console.log('No support for 3D Touch on this device.');
      }
    });
    
    // prevent native force touch behaviour on link wrappers
    $('a').pressure({
        startDeepPress: function(event) {
            event.preventDefault();
        }
    })

    // filter images by folder
    $('nav ol li').click(function(){
        $('nav ol li').removeClass();
    	if (!$(this).is('nav ol li:first') ) {
        	if ($(this).is('nav ol li:last')) {
                activeFilter = '.imgs';
                if ($(activeFilter).length == 0) {
	            	showmessage(unsortedmsg);   
                }
        	} else {
            	removemessage();
    		    activeFilter = '.'+$(this).text();
            }        
    	} else {
        	removemessage();
    		activeFilter = '*';	
    	}

    	// filter images & refresh waypoints
    	marked.isotope({filter: activeFilter}).on( 'layoutComplete', function() { Waypoint.refreshAll(); } );

    	// save active filter to local storage
    	localStorage.setItem('MARKfilter', activeFilter);
    	$(this).addClass('active');
    });
    
    // delete images
    $('a.del').each(function(){
        addDeleteFunction($(this));
    }); 
    
    
    // upload images by drag and drop
    
    // check if browser is capable
    var isAdvancedUpload = function() {
      var div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();
    
    if (isAdvancedUpload) { 
                
       var dragto = $('html');
       
       dragto.on('dragenter', function(e) {
           e.stopPropagation();
           e.preventDefault();
           
       }).on('dragover', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('body').addClass('drag');
            
       }).on('dragleave', function(e) {
           e.stopPropagation();
           e.preventDefault();
           $('body').removeClass('drag');
           
       }).on('drop', function (e) {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            
            // simple file type validation
            if (jQuery.inArray(files[0].type, filetypes) > -1) {
             
                var fdata = new FormData();
                fdata.append( 'u', files[0] );
                fdata.append( 'a', 'load');     
              
                var upload = $.ajax({
                    type: 'POST',                
                    url: 'mark.php',
                    processData: false,
                    contentType: false,
                    cache:false,
                    data: fdata,
                    dataType: 'JSON',
                    success: function(data) {
                        var imgName = data.img_name;
                        var thumbName = data.thumb_name;
                        var theIMG = $('<li class="imgs" data-thumb="'+thumbName+'" data-url="'+imgName+'" style="width: '+images.css('width')+';"><a class="del" href="javascript:void(0);">×</a><figure><a href="'+imgName+'"><img src="'+thumbName+'" /></a></figure></li>');
                    
                        // add delete feature
                        addDeleteFunction($('a.del', theIMG));
                    
                        $('img', theIMG).load(function(){
                    
                            // add to collection
                            marked.prepend(theIMG).isotope('prepended', theIMG)
                            marked.isotope('layout');
                          
                            $('body').removeClass('drag');
                                              
                        });
                    }
                }) 
            }
        })
        }  

	// upload images on touch-based devices
	$('#mobileUpload').change(function() {
        var fdata = new FormData();
        fdata.append( 'u', $('#mobileUpload')[0].files[0] );
        fdata.append( 'a', 'load');     
              
              $.ajax({
                 type: "POST",                
                 url: "mark.php",
                 processData: false,
                 contentType: false,
                 cache:false,
                 data: fdata,
                 dataType: 'JSON',
                 success: function(data) {
                     var imgName = data.img_name;
                     var thumbName = data.thumb_name;
                     var theIMG = $('<li class="imgs" data-thumb="'+thumbName+'" data-url="'+imgName+'" style="width: '+images.css('width')+';"><a class="del" href="javascript:void(0);">×</a><figure><a href="'+imgName+'"><img src="'+thumbName+'" /></a></figure></li>');
                 
                     // add delete feature
                     addDeleteFunction($('a.del', theIMG));
                 
                     $('img', theIMG).load(function(){
                 
                         // add to collection
                         marked.prepend(theIMG).isotope('prepended', theIMG)
                         marked.isotope('layout');
                       
                         $('body').removeClass('drag');
                                           
                     });
                 }
              });
	})
	
	// invert background color on touch-based devices
	$('#mobileInvert').click(function(){
		invertBG();	
	})
	
	// refresh image sizes & lazy load state when device orientation changes
	$(window).on('orientationchange',function(){
    	setImageHeights();
    	marked.isotope('layout',Waypoint.refreshAll());
    	
    	// have we switched from portrait to landscape?
    	if ($(window).width() > $(window).height()) {
    	    // trigger lazy load
    	    setTimeout( function() {
    	        $('body').scrollTop($('body').scrollTop()-80);
            }, 400 );        	
    	}

	})

});