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
    camera.lookAt(0,0,0);
    
    // Initial orthographic camera setup to be referenced when toggling ortho-perspective view
    cameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / - 50, - 500, 1000);

    cameraOrtho.position.set(0, 0, 20);

    // Copy of perspective camera to be referenced when ortho-perspective view is toggled
    cameraPerspective = camera.clone();

    // Add lighting to scene
    var light = new THREE.DirectionalLight("#fff", 3); 
    //var light = new THREE.AmbientLight(0xffffff);
    //var light = new THREE.SpotLight(0xffffff);
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

    let initialSetSize = getWindowSizes();
    
    renderer.setSize( initialSetSize[0], initialSetSize[1] );
    
    placement.appendChild( renderer.domElement );

  

    //make background transparent
    renderer.setClearColor(0x000000, 0); 
    renderer.gammaOutput = true;
    
    //document.addEventListener( 'mousemove', onMouseMove, false );

    // // Rotate, zoom, and click-drag model
    //   controls = new THREE.OrbitControls(camera, renderer.domElement);
    //   controls.autoRotate = true;
    //   controls.autoRotateSpeed = 1;
    
    window.addEventListener( 'resize', onResize, false );
 

    render()

 

} 

/**
 * Get canvas size width and height depending on window size
 * @return {array} width and height value of new canvas
 * 
 */
function getWindowSizes(){

    let width;
    let height;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // if(windowWidth >= 1500){
        width = windowWidth - 200;
        height = windowHeight - 200;
    // }

     if(windowWidth <= 700){
         width = windowWidth - 50;
         height = 350;

         document.removeEventListener( 'mousemove', onMouseMove, false );
         isMouseControl.disabled = true;
         isMouseControl.classList.add('disabledMouse');
         isRotateControl.checked = true;
     }

    return [width, height];
    
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

    let resizeSetSize = getWindowSizes();

    let width = resizeSetSize[0];
    let height = resizeSetSize[1];

    windowHalf.set( width / 2, height / 2 );
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );     
}



function update(){
    var easeAmount = 8;

    document.addEventListener( 'mousemove', onMouseMove, false );

    look.x += (mouse.x-look.x)/easeAmount;
    look.y += (mouse.y-look.y)/easeAmount;
    raycaster.setFromCamera(look, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    mesh.lookAt(pointOfIntersection);

}



function render() {

    //Display orthographic or perspective view 
    if(isOrthographic.checked){
        //Set camera to initial orthographic camera
        camera = cameraOrtho;
        mesh.scale.set( 2, 2, 2);

    }
    else{
        //Set camera to reference of initial perspective camera
        camera = cameraPerspective;
        if(modelLoaded){
            mesh.scale.set( 3, 3, 3);

        }

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

        if(isMouseControl.checked){
            update();
        }
        else if(isRotateControl.checked){

            document.removeEventListener( 'mousemove', onMouseMove, false );
            isMouseControl.disabled = true;
            isMouseControl.classList.add('disabledMouse');

            // Rotate, zoom, and click-drag model
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2;
            controls.enableZoom = false;
            controls.enablePan = false;
            //    controls.maxDistance = 100;
            //    controls.minDistance = 10;
            //    controls.maxZoom = 2;
            //    controls.minZoom = 0.5;
            controls.dampingFactor = 0.002;
            controls.rotateSpeed = 0.001;
            //    controls.enabled = false;

            controls.update();
        }
        else if(isDragControl.checked){

            isMouseControl.disabled = true;
            document.removeEventListener( 'mousemove', onMouseMove, false );
            isMouseControl.classList.add('disabledMouse');


            // Rotate, zoom, and click-drag model
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            //    controls.enabled = true;
            controls.autoRotate = false;
            controls.enableZoom = false;
            controls.enablePan = true;
            //    controls.maxDistance = 100;
            //    controls.minDistance = 10;
            //    controls.maxZoom = 2;
            //    controls.minZoom = 0.5;
            controls.dampingFactor = 0.002;
            controls.rotateSpeed = 0.001;
            
            controls.update();
        }
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
  