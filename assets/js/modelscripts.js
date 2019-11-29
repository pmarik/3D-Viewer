"use strict";

let camera, scene, renderer;
let mesh;
const mouse = new THREE.Vector2();
const look = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), -9);
var raycaster = new THREE.Raycaster();
var pointOfIntersection = new THREE.Vector3();
let modelLoaded = false;

let placement = document.getElementById("model_target");
let loaderPercent = document.getElementById('loader');




window.addEventListener('DOMContentLoaded', init);


function init() {
   
   
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 80, 1, 1, 1000);
    // camera = new THREE.OrthographicCamera( window.innerWidth / - 50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, - 500, 1000);

    camera.position.set(0, 0, 40)
    //camera.position.y = 0;


    var light = new THREE.DirectionalLight("#fff", 1.5); 
    var ambient = new THREE.AmbientLight("#FFF");
    light.position.set( 0, -70, 100 ).normalize();
    scene.add(light);
   // scene.add(ambient);

    var texture = new THREE.Texture();

    var loader = new THREE.GLTFLoader();

    THREE.Cache.enabled = true;

    // Load a glTF resource
    loader.load(
        // 3d model resource 
        '../assets/models/car2.glb',
        // called when the resource is loaded
        function ( gltf ) {

                mesh = gltf.scene;
                mesh.position.set(0,0,0);
                mesh.scale.set( 4, 4, 4 );
                scene.add( mesh );

        },
        // called when loading is in progress
        function ( xhr ) {

                // Loading progress of model
                console.log(xhr);
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                loaderPercent.innerHTML = `<p> ${(xhr.loaded / xhr.total * 100).toFixed(0)}% </p>`;

                if((xhr.loaded / xhr.total * 100) == 100){
                    modelLoaded = true;
                    loaderPercent.setAttribute('style', 'display: none;');
                } 

        },
        // called when loading has errors
        function ( error ) {

                console.log( error );

        }
    );

   


    renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true  } );
    renderer.setSize( 1000, 500 );
    
    placement.appendChild( renderer.domElement );



    //make background transparent
    renderer.setClearColor(0x000000, 0); 
    renderer.gammaOutput = true;
    
    document.addEventListener( 'mousemove', onMouseMove, false );
    
    window.addEventListener( 'resize', onResize, false );
 

    render()

 

} 

function onMouseMove( event ) {

    if (modelLoaded){
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    mesh.lookAt(pointOfIntersection);
    }
 
}



function onResize( event ) {

    const width = 800 ;
    const height = 500;

    windowHalf.set( width / 2, height / 2 );
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );     
}

var easeAmount = 8;

function update(){
    look.x += (mouse.x-look.x)/easeAmount;
    look.y += (mouse.y-look.y)/easeAmount;
    raycaster.setFromCamera(look, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    mesh.lookAt(pointOfIntersection);
}



function render() {

    camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame( render );

    if (modelLoaded){
        update();
    }
    // if (resize(renderer)) {
    //     camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //     camera.updateProjectionMatrix();
    //   }
    renderer.render( scene, camera );

}                 


function resize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  