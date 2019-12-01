"use strict";

let camera, scene, renderer, mesh, controls, cameraOrtho, cameraPerspective;
const mouse = new THREE.Vector2();
const look = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), -9);
var raycaster = new THREE.Raycaster();
var pointOfIntersection = new THREE.Vector3();
let modelLoaded = false;

// Place to render canvas
let placement = document.getElementById("model_target");

// Loader variables to track progress of model load percentage
let loaderPercent = document.getElementById('loader');
let loaderProgress = document.getElementById('loader-progress');
let loaderMain = document.getElementById('loader-main');

// Tracks corresponding background color is checked to determine background color toggle
let solidColorToggle = document.getElementById('backgroundColor-input-solid');
let solidColorToggle2 = document.getElementById('backgroundColor-input-solid2');

// Tracks checked behavior of orthographic button to toggle camera style
let isOrthographic = document.getElementById('view-input-orthographic');

// Tracks corresponding checked behavior of controls used to move the model
let isMouseControl = document.getElementById('control-input-mouse');
let isRotateControl = document.getElementById('control-input-rotating');
let isDragControl = document.getElementById('control-input-drag');

// controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;
// controls.autoRotateSpeed = 1;



window.addEventListener('DOMContentLoaded', init);

/**
 * Initial camera setup and loading of 3D model
 * 
 */
function init() {
   
    scene = new THREE.Scene();

    // Inital perspective camera
    camera = new THREE.PerspectiveCamera( 45, 1, 1, 1000);
    camera.position.set(0, 0, 40)
    //camera.position.y = 0;
    
    // Initial orthographic camera setup to be referenced when toggling ortho-perspective view
    cameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, - 500, 1000);
    cameraOrtho.position.set(0, 0, 40);

    // Copy of perspective camera to be referenced when ortho-perspective view is toggled
    cameraPerspective = camera.clone();


    // Add lighting to scene
    var light = new THREE.DirectionalLight("#fff", 3); 
    light.position.set( -70, 70, 100 ).normalize();
    scene.add(light);
    //var ambient = new THREE.AmbientLight("#FFF");
    //scene.add(ambient);

    var texture = new THREE.Texture();

    var loader = new THREE.GLTFLoader();

    THREE.Cache.enabled = true;

    // Load a glTF resource
    loader.load(
        // 3d model resource 
        '../assets/models/laptop.glb',
        // Set model in scene, called when the resource is loaded
        function ( gltf ) {
                mesh = gltf.scene;
                mesh.position.set(0,0,0);
                mesh.scale.set( 3, 3, 3);
                scene.add( mesh );
        },
        // called when loading is in progress
        function ( xhr ) {

                // Loading progress of model
                console.log(xhr);
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                loaderPercent.innerHTML = `<p> ${(xhr.loaded / xhr.total * 100).toFixed(0)}% </p>`;
                loaderProgress.setAttribute('style',  `width: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);

                // Remove loader progress bar when model is 100% loaded
                if((xhr.loaded / xhr.total * 100) == 100){
                    modelLoaded = true;
                    loaderPercent.setAttribute('style', 'display: none;');
                    loaderMain.setAttribute('style', 'display: none;');
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

/** 
 * Track camera to mouse movement
 * @param {event} event onmousemove
 * 
 */
function onMouseMove( event ) {
    if (modelLoaded){
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    mesh.lookAt(pointOfIntersection);
    }
}


/**
 * Adjust camera aspect on window resize
 * @param {event} event window resize
 * 
 */
function onResize( event ) {
    const width = 800 ;
    const height = 500;

    windowHalf.set( width / 2, height / 2 );
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );     
}



function update(controlString){
    var easeAmount = 8;
    // if(controlString === "mouseControl"){
    //     //document.addEventListener( 'mousemove', onMouseMove, false );

        look.x += (mouse.x-look.x)/easeAmount;
        look.y += (mouse.y-look.y)/easeAmount;
        raycaster.setFromCamera(look, camera);
        raycaster.ray.intersectPlane(plane, pointOfIntersection);
        mesh.lookAt(pointOfIntersection);

    //     console.log(controlString);

    // }

    // else{
    //     console.log("controlString");
    //     //document.removeEventListener( 'mousemove', onMouseMove, false );


    // }
  
}



function render() {

    //Display orthographic or perspective view 
    if(isOrthographic.checked){
        //Set camera to initial orthographic camera
        camera = cameraOrtho;
    }
    else{
        //Set camera to reference of initial perspective camera
        camera = cameraPerspective;
    }

    //set background color based on checkbox inputs
    if (solidColorToggle.checked){
        scene.background = new THREE.Color(0xfffffff); //Set background color 
    }
    else if(solidColorToggle2.checked){
        scene.background = new THREE.Color(0x0000000); //Set background color 
    }
    else{
        scene.background = null;
    }

    camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame( render );

    if (modelLoaded){

        //Pass controls to update depending on checked state determined by user
        // if(isMouseControl.checked){
        //     update("mouseControl");
        // }
        // else{
        //     update("rotateControl");
        // }

        update();
    }
    // if (resize(renderer)) {
    //     camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //     camera.updateProjectionMatrix();
    //   }


    //controls.update();
    renderer.render( scene, camera );

}                 


/**
 * Update canvas on window resize
 * @param {object} renderer new aspect ratio of canvas
 * 
 */
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
  