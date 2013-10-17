var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

function RunGame(){
	init();
	animate();
}

function init() {

	container = document.getElementById( "container" );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 1000;

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	container.appendChild( renderer.domElement );

	renderer.domElement.addEventListener( 'mousemove', onMouseMove );

	controls = new THREE.TrackballControls( camera , renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	scene = new THREE.Scene();

	pickingScene = new THREE.Scene();
	pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
	pickingTexture.generateMipmaps = false;

	scene.add( new THREE.AmbientLight( 0x555555 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	scene.add( light );

	var geometry = new THREE.Geometry(),
	pickingGeometry = new THREE.Geometry(),
	pickingMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } ),
	defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors	} );

	function applyVertexColors( g, c ) {

		g.faces.forEach( function( f ) {

			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

			for( var j = 0; j < n; j ++ ) {

				f.vertexColors[ j ] = c;

			}

		} );

	}

	for ( var i = 0; i < 5000; i ++ ) {

		var position = new THREE.Vector3();

		position.x = Math.random() * 10000 - 5000;
		position.y = Math.random() * 6000 - 3000;
		position.z = Math.random() * 8000 - 4000;

		var rotation = new THREE.Euler();

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;

		var scale = new THREE.Vector3();

		scale.x = Math.random() * 200 + 100;
		scale.y = Math.random() * 200 + 100;
		scale.z = Math.random() * 200 + 100;

		// give the geom's vertices a random color, to be displayed

		var geom = new THREE.CubeGeometry( 1, 1, 1 );
		var color = new THREE.Color( Math.random() * 0xffffff );
		applyVertexColors( geom, color );

		var cube = new THREE.Mesh( geom );
		cube.position.copy( position );
		cube.rotation.copy( rotation );
		cube.scale.copy( scale );

		THREE.GeometryUtils.merge( geometry, cube );

		//give the pickingGeom's vertices a color corresponding to the "id"

		var pickingGeom = new THREE.CubeGeometry( 1, 1, 1 );
		var pickingColor = new THREE.Color( i );
		applyVertexColors( pickingGeom, pickingColor );

		var pickingCube = new THREE.Mesh( pickingGeom );
		pickingCube.position.copy( position );
		pickingCube.rotation.copy( rotation );
		pickingCube.scale.copy( scale );

		THREE.GeometryUtils.merge( pickingGeometry, pickingCube );

		pickingData[ i ] = {

			position: position,
			rotation: rotation,
			scale: scale

		};

	}

	var drawnObject = new THREE.Mesh( geometry, defaultMaterial );
	scene.add( drawnObject );

	pickingScene.add( new THREE.Mesh( pickingGeometry, pickingMaterial ) );

	highlightBox = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshLambertMaterial( { color: 0xffff00 } ) );
	scene.add( highlightBox );

	projector = new THREE.Projector();

}

//

function onMouseMove( e ) {

	mouse.x = e.clientX;
	mouse.y = e.clientY;

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function pick() {

	//render the picking scene off-screen

	renderer.render( pickingScene, camera, pickingTexture );

	var gl = self.renderer.getContext();

	//read the pixel under the mouse from the texture

	var pixelBuffer = new Uint8Array( 4 );
	gl.readPixels( mouse.x, pickingTexture.height - mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer );

	//interpret the pixel as an ID

	var id = ( pixelBuffer[0] << 16 ) | ( pixelBuffer[1] << 8 ) | ( pixelBuffer[2] );
	var data = pickingData[ id ];

	if ( data) {

		//move our highlightBox so that it surrounds the picked object

		if ( data.position && data.rotation && data.scale ){

			highlightBox.position.copy( data.position );
			highlightBox.rotation.copy( data.rotation );
			highlightBox.scale.copy( data.scale ).add( offset );
			highlightBox.visible = true;

		}

	} else {

		highlightBox.visible = false;

	}

}

function render() {

	controls.update();

	pick();

	renderer.render( scene, camera );

}

/*

THREE JS STUFF BELOW

*/


/*
=======
>>>>>>> feature/front_page
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(2,2,2);
var material = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

window.addEventListener( 'resize', onWindowResize, false );

var render = function () {
	requestAnimationFrame(render);

	cube.rotation.x += 0.02;
	cube.rotation.y += 0.02;

	renderer.render(scene, camera);
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

<<<<<<< HEAD
var peer = new Peer({key: 'jlr92mqbkkai3sor'});


render();
*/
