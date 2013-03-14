/*
Copyright (c) 2013 Wei Cheng Pan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
!function() {
	'use strict';

	// add css vendor prefix for jQuery
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
		if( event.keyCode === 35 || event.keyCode === 36 || event.keyCode === 66 || event.keyCode === 67 ) {
			event.preventDefault();
			switch( event.keyCode ) {
			case 35:	// End
				api.goto( slides[slides.length-1] );
				break;
			case 36:	// Home
				api.goto( slides[0] );
				break;
			case 66:	// b
				toggleBanner();
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
		if( event.keyCode === 35 || event.keyCode === 36 || event.keyCode === 66 || event.keyCode === 67 ) {
			event.preventDefault();
		}
	} );

	function toggleBanner() {
		$( '#banner' ).toggleClass( 'hidden' );
	}

	function randomize( target ) {
		function gr( l, u ) {
			return Math.floor( Math.random() * ( u - l ) ) + l;
		}
		function rc( l ) {
			var i = gr( 0, l.length );
			return l[i];
		}
		var children = $( target ).children();
		children.each( function() {
			var x = gr( -350, 350 );
			var y = gr( -200, 200 );
			var z = gr( -400, 400 );
			var r = gr( -90, 90 );
			var p = [ 'translateX(', x, 'px) translateY(', y, 'px) translateZ(', z, 'px) rotate(', r, 'deg)' ].join( '' );
			var c = rc( [ 'gray', 'red', 'green', 'blue' ] );
			$( this ).css( {
				transform: p,
				color: c,
			} );
		} );

		var interval = 2000;
		var i = 0;
		function run() {
			if( i >= children.length ) {
				return false;
			}
			var c = $( children[i] );
			c.css( {
				position: 'absolute',
				display: 'inline-block',
			} );
			var o = ( c.parent().width() - c.width() ) / 2;
			c.css( {
				left: o + 'px',
			} );
			++i;
			interval /= 2;
			window.setTimeout( run, interval );
		}
		run();
	}

	$( '#random' ).one( 'impress:stepenter', function( event ) {
		randomize( this );
	} );

	$( '#overview' ).on( 'impress:stepenter', function( event ) {
		$( 'div.step' ).addClass( 'enhance' );
	} ).on( 'impress:stepleave', function( event ) {
		$( 'div.step' ).removeClass( 'enhance' );
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

	var socket = io.connect( 'http://localhost:9527/' );
	socket.on( 'connect_failed', function() {
		console.log( 'connect_failed', arguments );
	} );
	socket.on( 'error', function() {
		console.log( 'error', arguments );
	} );
	socket.on( 'comment', function( data ) {
		addComment( data );
	} );
}();
