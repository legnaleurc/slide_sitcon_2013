var CHANNEL = '#barrage';
var NICK = 'comment';
var PORT = 3000;

var IRC = require( 'irc' );
var SocketIO = require( 'socket.io' );

var server = SocketIO.listen( PORT );
server.sockets.on( 'connection', function( socket ) {
	socket.join( CHANNEL );
} );

var client = new IRC.Client( 'irc.freenode.net', NICK, {
	channels: [
		CHANNEL,
	],
} );
client.addListener( 'message', function( nick, to, text ) {
	var pattern = new RegExp( '^' + NICK + '[,:]\\s*(.*)\\s*$' );
	pattern = text.match( pattern );
	if( to === CHANNEL && !pattern ) {
		text = pattern[1];
	} else if( to !== NICK ) {
		return;
	}
	server.sockets.in( CHANNEL ).emit( 'comment', text );
} );
client.addListener( 'error', function( msg ) {
	console.log( msg );
} );
