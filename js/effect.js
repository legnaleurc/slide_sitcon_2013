!function() {
	'use strict';

	/*
	add css vendor prefix for jQuery
	*/
	function addCSSVendorPrefix( prop, hook ) {
		function mangleStyle( prop ) {
			var supportedProp = null;
			var prefixes = [ 'O', 'Ms', 'Moz', 'webkit' ];
			if( prop in document.body.style ) {
				supportedProp = prop;
			} else {
				var capProp = prop.charAt(0).toUpperCase() + prop.slice(1);
				for( var i = 0; i < prefixes.length; ++i ) {
					var vendorProp = prefixes[i] + capProp;
					if( vendorProp in document.body.style ) {
						supportedProp = vendorProp;
						break;
					}
				}
			}
			jQuery.support[prop] = supportedProp;
			return supportedProp;
		}
		function bind( f ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			return function() {
				return f.apply( this, args.concat( Array.prototype.slice.call( arguments ) ) );
			};
		}

		var mangledProp = mangleStyle( prop );
		if( mangledProp && mangledProp !== prop ) {
			jQuery.cssHooks[prop] = {
				get: function( elem, computed, extra ) {
					return jQuery.css( elem, mangledProp );
				},
				set: ( ( hook && hook.set ) ? bind( hook.set, mangledProp ) : function( elem, value ) {
					elem.style[mangledProp] = value;
				} ),
			};
		}
	}
	addCSSVendorPrefix( 'transition', {
		set: function( mangledProp, elem, value ) {
			if( jQuery.support.transform === 'webkitTransform' ) {
				value = value.replace( 'transform', '-webkit-transform' );
			}
			elem.style[mangledProp] = value;
		},
	} );
	addCSSVendorPrefix( 'transform' );


	if( !impress.supported ) {
		return;
	}
	var api = impress();
	api.init();

	var slides = document.querySelectorAll( 'div.step' );
	$( document ).on( 'keyup', function( event ) {
		if( event.keyCode === 35 || event.keyCode === 36 || event.keyCode === 67 ) {
			event.preventDefault();
			switch( event.keyCode ) {
			case 35:	// End
				api.goto( slides[slides.length-1] );
				break;
			case 36:	// Home
				api.goto( slides[0] );
				break;
			case 67:	// c
				toggleComment();
				break;
			default:
				break;
			}
		}
	} );
	// disables default key action
	$( document ).on( 'keydown', function( event ) {
		if( event.keyCode === 35 || event.keyCode === 36 || event.keyCode === 67 ) {
			event.preventDefault();
		}
	} );

	function addComment( comment ) {
		function adjustOverlap( comment, ctx ) {
			var a = window.screen.availWidth / 2;
			a = {
				top: comment.offset().top,
				bottom: comment.offset().top + comment.outerHeight( true ),
				left: comment.offset().left - a,	// leave space to avoid overlap by speed
				right: comment.offset().left + comment.outerWidth( true ),
			};
			$( 'div.comment', ctx ).each( function( i, v ) {
				var b = $( v );
				b = {
					top: b.offset().top,
					bottom: b.offset().top + b.outerHeight( true ),
					left: b.offset().left,
					right: b.offset().left + b.outerWidth( true ),
				};
				if( b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top ) {
					var offset = comment.outerHeight( true );
					comment.css( {
						top: comment.offset().top + offset,
					} );
					a.top += offset;
					a.bottom += offset;
					if( a.bottom > window.screen.availHeight ) {
						console.log( 'comment overflow: ' + comment.text() );
					}
				}
			} );
		}

		var ctx = $( '#barrage' );
		comment = jQuery.parseHTML( comment );
		comment = $( comment ).text();
		comment = jQuery.parseHTML( '<div><span>' + comment + '</span></div>' );
		comment = $( comment );
		ctx.append( comment );
		comment.css( {
			left: window.screen.availWidth,
		} );
		adjustOverlap( comment, ctx );
		comment.css( {
			transition: 'transform 4s linear',
			transform: 'translateX(-' + ( comment.outerWidth( true ) + window.screen.availWidth ) + 'px)',
		} );
		comment.on( 'transitionend webkitTransitionEnd', function() {
			$( this ).remove();
		} );
		comment.addClass( 'comment' );
		if( ctx.data( 'disabled' ) ) {
			comment.addClass( 'hidden' );
		}
	}
	function toggleComment() {
		var ctx = $( '#barrage' );
		ctx.data( 'disabled', !ctx.data( 'disabled' ) );
		if( ctx.data( 'disabled' ) ) {
			ctx.children().addClass( 'hidden' );
		} else {
			ctx.children().removeClass( 'hidden' );
		}
	}
	$( '#barrage' ).data( 'disabled', false );

	function randomComment() {
		function gr( l, u ) {
			return Math.floor( Math.random() * ( u - l ) ) + l;
		}

		var length = gr( 1, 140 );
		var a = new Array( length );
		for( var i = 0; i < length; ++i ) {
			a[i] = 'w';
		}
		return a.join( '' );
	}
	window.setInterval( function() {
		addComment( randomComment() );
	}, 1000 );
}();
