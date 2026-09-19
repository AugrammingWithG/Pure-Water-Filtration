import{C as e,O as t,T as n}from"./index-BcA-taHp.js";import{$ as r,At as i,B as a,Ct as o,Ft as s,G as c,H as l,J as u,K as d,L as f,Mt as p,Nt as m,Pt as h,Q as ee,St as g,Tt as _,U as v,V as te,at as y,bt as ne,d as b,f as re,ft as ie,h as ae,ht as x,jt as oe,m as S,pt as C,q as w,t as T,u as E,ut as D,wt as O,y as k,yt as se,z as A}from"./WholeHouseUnit-3awjBESl.js";import{t as j}from"./useMediaQuery-CCFy5EtD.js";var M=parseInt(`186`.replace(/\D+/g,``)),N=class extends _{constructor(e=new p){super({uniforms:{inputBuffer:new i(null),depthBuffer:new i(null),resolution:new i(new p),texelSize:new i(new p),halfTexelSize:new i(new p),kernel:new i(0),scale:new i(1),cameraNear:new i(0),cameraFar:new i(1),minDepthThreshold:new i(0),maxDepthThreshold:new i(1),depthScale:new i(0),depthToBlurRatioBias:new i(.25)},fragmentShader:`#include <common>
        #include <dithering_pars_fragment>      
        uniform sampler2D inputBuffer;
        uniform sampler2D depthBuffer;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          float depthFactor = 0.0;
          
          #ifdef USE_DEPTH
            vec4 depth = texture2D(depthBuffer, vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0, min(1.0, depthFactor + 0.25));
          #endif
          
          vec4 sum = texture2D(inputBuffer, mix(vUv0, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv1, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv2, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv3, vUv, depthFactor));
          gl_FragColor = sum * 0.25 ;

          #include <dithering_fragment>
          #include <tonemapping_fragment>
          #include <${M>=154?`colorspace_fragment`:`encodings_fragment`}>
        }`,vertexShader:`uniform vec2 texelSize;
        uniform vec2 halfTexelSize;
        uniform float kernel;
        uniform float scale;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          vec2 uv = position.xy * 0.5 + 0.5;
          vUv = uv;

          vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;
          vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
          vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
          vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
          vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,blending:0,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}},ce=class{constructor({gl:e,resolution:t,width:n=500,height:r=500,minDepthThreshold:i=0,maxDepthThreshold:a=1,depthScale:o=0,depthToBlurRatioBias:l=.25}){this.renderToScreen=!1,this.renderTargetA=new s(t,t,{minFilter:D,magFilter:D,stencilBuffer:!1,depthBuffer:!1,type:y}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new N,this.convolutionMaterial.setTexelSize(1/n,1/r),this.convolutionMaterial.setResolution(new p(n,r)),this.scene=new O,this.camera=new w,this.convolutionMaterial.uniforms.minDepthThreshold.value=i,this.convolutionMaterial.uniforms.maxDepthThreshold.value=a,this.convolutionMaterial.uniforms.depthScale.value=o,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=l,this.convolutionMaterial.defines.USE_DEPTH=o>0;let u=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),f=new Float32Array([0,0,2,0,0,2]),m=new d;m.setAttribute(`position`,new c(u,3)),m.setAttribute(`uv`,new c(f,2)),this.screen=new C(m,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,n){let r=this.scene,i=this.camera,a=this.renderTargetA,o=this.renderTargetB,s=this.convolutionMaterial,c=s.uniforms;c.depthBuffer.value=t.depthTexture;let l=s.kernel,u=t,d,f,p;for(f=0,p=l.length-1;f<p;++f)d=f&1?o:a,c.kernel.value=l[f],c.inputBuffer.value=u.texture,e.setRenderTarget(d),e.render(r,i),u=d;c.kernel.value=l[f],c.inputBuffer.value=u.texture,e.setRenderTarget(this.renderToScreen?null:n),e.render(r,i)}},le=class extends x{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;(t=e.defines)!=null&&t.USE_UV||(e.defines.USE_UV=``),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
      ${e.vertexShader}`,e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`),e.fragmentShader=`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv;
        ${e.fragmentShader}`,e.fragmentShader=e.fragmentShader.replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>

      float distortionFactor = 0.0;
      #ifdef USE_DISTORTION
        distortionFactor = texture2D(distortionMap, vUv).r * distortion;
      #endif

      vec4 new_vUv = my_vUv;
      new_vUv.x += distortionFactor;
      new_vUv.y += distortionFactor;

      vec4 base = texture2DProj(tDiffuse, new_vUv);
      vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);

      vec4 merge = base;

      #ifdef USE_NORMALMAP
        vec2 normal_uv = vec2(0.0);
        vec4 normalColor = texture2D(normalMap, vUv * normalScale);
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        vec3 coord = new_vUv.xyz / new_vUv.w;
        normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
        vec4 base_normal = texture2D(tDiffuse, normal_uv);
        vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
        merge = base_normal;
        blur = blur_normal;
      #endif

      float depthFactor = 0.0001;
      float blurFactor = 0.0;

      #ifdef USE_DEPTH
        vec4 depth = texture2DProj(tDepth, new_vUv);
        depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
        depthFactor *= depthScale;
        depthFactor = max(0.0001, min(1.0, depthFactor));

        #ifdef USE_BLUR
          blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
          merge = merge * min(1.0, depthFactor + 0.5);
        #else
          merge = merge * depthFactor;
        #endif

      #endif

      float reflectorRoughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
        reflectorRoughnessFactor *= reflectorTexelRoughness.g;
      #endif

      #ifdef USE_BLUR
        blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
        merge = mix(merge, blur, blurFactor);
      #endif

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;

      diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}},P=t(n()),F=P.forwardRef(({mixBlur:e=0,mixStrength:t=1,resolution:n=256,blur:i=[0,0],minDepthThreshold:a=.9,maxDepthThreshold:o=1,depthScale:c=0,depthToBlurRatioBias:u=.25,mirror:d=0,distortion:f=1,mixContrast:p=1,distortionMap:g,reflectorOffset:_=0,...b},re)=>{te({MeshReflectorMaterialImpl:le});let x=v(({gl:e})=>e),S=v(({camera:e})=>e),C=v(({scene:e})=>e);i=Array.isArray(i)?i:[i,i];let w=i[0]+i[1]>0,T=i[0],E=i[1],O=P.useRef(null);P.useImperativeHandle(re,()=>O.current,[]);let[k]=P.useState(()=>new ne),[A]=P.useState(()=>new m),[j]=P.useState(()=>new m),[M]=P.useState(()=>new m),[N]=P.useState(()=>new ie),[F]=P.useState(()=>new m(0,0,-1)),[I]=P.useState(()=>new h),[L]=P.useState(()=>new m),[R]=P.useState(()=>new m),[z]=P.useState(()=>new h),[B]=P.useState(()=>new ie),[V]=P.useState(()=>new se),H=P.useCallback(()=>{var e;let t=O.current.parent||((e=O.current)==null||(e=e.__r3f.parent)==null?void 0:e.object);if(!t||(j.setFromMatrixPosition(t.matrixWorld),M.setFromMatrixPosition(S.matrixWorld),N.extractRotation(t.matrixWorld),A.set(0,0,1),A.applyMatrix4(N),j.addScaledVector(A,_),L.subVectors(j,M),L.dot(A)>0))return;L.reflect(A).negate(),L.add(j),N.extractRotation(S.matrixWorld),F.set(0,0,-1),F.applyMatrix4(N),F.add(M),R.subVectors(j,F),R.reflect(A).negate(),R.add(j),V.position.copy(L),V.up.set(0,1,0),V.up.applyMatrix4(N),V.up.reflect(A),V.lookAt(R),V.far=S.far,V.updateMatrixWorld(),V.projectionMatrix.copy(S.projectionMatrix),B.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),B.multiply(V.projectionMatrix),B.multiply(V.matrixWorldInverse),B.multiply(t.matrixWorld),k.setFromNormalAndCoplanarPoint(A,j),k.applyMatrix4(V.matrixWorldInverse),I.set(k.normal.x,k.normal.y,k.normal.z,k.constant);let n=V.projectionMatrix;z.x=(Math.sign(I.x)+n.elements[8])/n.elements[0],z.y=(Math.sign(I.y)+n.elements[9])/n.elements[5],z.z=-1,z.w=(1+n.elements[10])/n.elements[14],I.multiplyScalar(2/I.dot(z)),n.elements[2]=I.x,n.elements[6]=I.y,n.elements[10]=I.z+1,n.elements[14]=I.w},[S,_]),[U,W,G,K]=P.useMemo(()=>{let i={minFilter:D,magFilter:D,type:y},l=new s(n,n,i);l.depthBuffer=!0,l.depthTexture=new r(n,n),l.depthTexture.format=ee,l.depthTexture.type=oe;let m=new s(n,n,i);return[l,m,new ce({gl:x,resolution:n,width:T,height:E,minDepthThreshold:a,maxDepthThreshold:o,depthScale:c,depthToBlurRatioBias:u}),{mirror:d,textureMatrix:B,mixBlur:e,tDiffuse:l.texture,tDepth:l.depthTexture,tDiffuseBlur:m.texture,hasBlur:w,mixStrength:t,minDepthThreshold:a,maxDepthThreshold:o,depthScale:c,depthToBlurRatioBias:u,distortion:f,distortionMap:g,mixContrast:p,"defines-USE_BLUR":w?``:void 0,"defines-USE_DEPTH":c>0?``:void 0,"defines-USE_DISTORTION":g?``:void 0}]},[x,T,E,B,n,d,w,e,t,a,o,c,u,f,g,p]);return l(()=>{var e;let t=O.current.parent||((e=O.current)==null||(e=e.__r3f.parent)==null?void 0:e.object);if(!t)return;t.visible=!1;let n=x.xr.enabled,r=x.shadowMap.autoUpdate;H(),x.xr.enabled=!1,x.shadowMap.autoUpdate=!1,x.setRenderTarget(U),x.state.buffers.depth.setMask(!0),x.autoClear||x.clear(),x.render(C,V),w&&G.render(x,U,W),x.xr.enabled=n,x.shadowMap.autoUpdate=r,t.visible=!0,x.setRenderTarget(null)}),P.createElement(`meshReflectorMaterialImpl`,ae({attach:`material`,key:`key`+K[`defines-USE_BLUR`]+K[`defines-USE_DEPTH`]+K[`defines-USE_DISTORTION`],ref:O},K,b))}),I=`/Pure-Water-Filtration/assets/white-stucco-diff-HSzhLxbm.webp`,L=`/Pure-Water-Filtration/assets/white-stucco-nor-ChDJd08X.webp`,R=`/Pure-Water-Filtration/assets/white-stucco-arm-CjkIuEj6.webp`,z=`/Pure-Water-Filtration/assets/brown-floor-tiles-diff-CXI7TELq.webp`,B=`/Pure-Water-Filtration/assets/brown-floor-tiles-nor-CKpRZ0V2.webp`,V=`/Pure-Water-Filtration/assets/brown-floor-tiles-arm-HkZmwyYx.webp`,H=e(),U=[-f.center.x,0,-f.center.z];f.depth/2;var W=-f.depth/2,G=f.riserX-f.center.x,K=W-.02,ue=14934494,q=14211548,J=[14,6],de=2,fe=1.6,pe=[14,10],me=1.7,he=1,ge=16774114,_e=13229042,ve=12376063,ye=13820148,be=11774620,xe={wide:{position:[.85,1.55,2.35],target:[-.35,1.15,0],fov:30},stacked:{position:[.5,2.7,2.75],target:[0,1.15,0],fov:56}},Y={x:.12,y:.06,targetFollow:.35};function Se({stacked:e}){let t=v(e=>e.camera),n=v(e=>e.gl),r=e?xe.stacked:xe.wide,i=(0,P.useRef)(new m),a=(0,P.useRef)(new m),o=(0,P.useRef)({x:0,y:0}),s=(0,P.useRef)({x:0,y:0});return(0,P.useEffect)(()=>{if(!window.matchMedia?.(`(hover: hover) and (pointer: fine)`).matches)return;let e=n.domElement.closest(`.hero`)??n.domElement,t=t=>{let n=e.getBoundingClientRect();o.current.x=(t.clientX-n.left)/n.width*2-1,o.current.y=(t.clientY-n.top)/n.height*2-1},r=()=>{o.current.x=0,o.current.y=0};return e.addEventListener(`pointermove`,t,{passive:!0}),e.addEventListener(`pointerleave`,r),()=>{e.removeEventListener(`pointermove`,t),e.removeEventListener(`pointerleave`,r),r()}},[n]),l(({clock:e},n)=>{i.current.set(...r.position),a.current.set(...r.target);let c=e.getElapsedTime(),l=Math.sin(c*.5)*.06,u=Math.sin(c*.35+1.2)*.03,d=s.current,f=1-Math.exp(-n*4);d.x+=(o.current.x*Y.x-d.x)*f,d.y+=(-o.current.y*Y.y-d.y)*f,t.position.set(i.current.x+l+d.x,i.current.y+u+d.y,i.current.z),t.fov!==r.fov&&(t.fov=r.fov,t.updateProjectionMatrix()),a.current.x+=d.x*Y.targetFollow,a.current.y+=d.y*Y.targetFollow,t.lookAt(a.current)}),null}function Ce(){let{shadowMap:e}=A();return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`hemisphereLight`,{args:[_e,be,.5]}),(0,H.jsx)(`directionalLight`,{color:ge,intensity:4.4,position:[-3.2,3.4,2.6],castShadow:!0,"shadow-mapSize":[e,e],"shadow-bias":-4e-4,"shadow-normalBias":.02,"shadow-radius":6,"shadow-intensity":.92,"shadow-camera-left":-3,"shadow-camera-right":3,"shadow-camera-top":3,"shadow-camera-bottom":-2,"shadow-camera-near":1,"shadow-camera-far":10}),(0,H.jsx)(`directionalLight`,{color:ye,intensity:.85,position:[-3,1.6,2.4]}),(0,H.jsx)(`directionalLight`,{color:ve,intensity:.45,position:[2.2,2.4,-1.6]})]})}function we(e,t,n){let r=v(e=>e.gl),[i,a,s]=S(e);return(0,P.useMemo)(()=>{let e=Math.min(8,r.capabilities.getMaxAnisotropy()),c=(r,i)=>{let a=r.clone();return a.wrapS=g,a.wrapT=g,a.repeat.set(t[0]/n,t[1]/n),a.colorSpace=i,a.anisotropy=e,a.needsUpdate=!0,a};return{map:c(i,o),normalMap:c(a,``),armMap:c(s,``)}},[r,i,a,s,t,n])}var Te=[I,L,R],Ee=[z,B,V];function De(){return we(Te,J,de)}function Oe(){return we(Ee,pe,me)}var X=1.6,Z=[1024,512],Q=Z[0]/J[0];function $(e,t){return[(e+J[0]/2)/J[0]*Z[0],(1-(t-X+J[1]/2)/J[1])*Z[1]]}var ke=`rgba(130,140,160,1)`,Ae=`rgba(150,158,174,1)`,je=.12,Me=[{quad:[[-.76,1.72],[1.26,1.57],[1.36,.15],[-.68,.28]],brightness:1},{quad:[[-2.9,2.2],[-1.05,2.1],[-.98,1.55],[-2.85,1.62]],brightness:.82}];function Ne(){return(0,P.useMemo)(()=>{let e=document.createElement(`canvas`);e.width=Z[0],e.height=Z[1];let t=e.getContext(`2d`);{let n=t.createLinearGradient(0,0,0,e.height);n.addColorStop(0,ke),n.addColorStop(1,Ae),t.fillStyle=n,t.fillRect(0,0,e.width,e.height)}t.save(),`filter`in t&&(t.filter=`blur(${Math.round(je*Q)}px)`);for(let{quad:e,brightness:n}of Me)t.beginPath(),e.forEach(([e,n],r)=>{let[i,a]=$(e,n);r===0?t.moveTo(i,a):t.lineTo(i,a)}),t.closePath(),t.fillStyle=`rgba(255,255,255,${n})`,t.fill();t.restore();{let e=7,n=()=>(e=e*16807%2147483647,e/2147483647);t.save(),t.globalCompositeOperation=`multiply`;for(let e=0;e<70;e++){let e=.7+n()*.9+n()*.6,r=.6+n()*1+n()*.5,i=(.12+n()*.22)*Q,[a,o]=$(e,r),s=.3+n()*.25,c=t.createRadialGradient(a,o,0,a,o,i);c.addColorStop(0,`rgba(158,170,190,${s})`),c.addColorStop(.55,`rgba(158,170,190,${s*.7})`),c.addColorStop(1,`rgba(158,170,190,0)`),t.fillStyle=c,t.save(),t.translate(a,o),t.rotate(n()*Math.PI),t.scale(1,.45+n()*.5),t.translate(-a,-o),t.fillRect(a-i,o-i,i*2,i*2),t.restore()}t.restore()}let n=new u(e);return n.colorSpace=o,n},[])}function Pe(){let{map:e,normalMap:t,armMap:n}=De(),r=Ne();return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsxs)(`mesh`,{position:[0,X,K],receiveShadow:!0,children:[(0,H.jsx)(`planeGeometry`,{args:J}),(0,H.jsx)(`meshStandardMaterial`,{color:ue,map:e,normalMap:t,normalScale:[fe,fe],aoMap:n,roughnessMap:n,roughness:1,metalness:0})]}),(0,H.jsxs)(`mesh`,{position:[0,X,K+.004],children:[(0,H.jsx)(`planeGeometry`,{args:J}),(0,H.jsx)(`meshBasicMaterial`,{map:r,blending:4,premultipliedAlpha:!0,transparent:!0,depthWrite:!1,toneMapped:!1})]})]})}function Fe(){let{name:e}=A(),{map:t,normalMap:n,armMap:r}=Oe(),i=[he,he];return(0,H.jsxs)(`mesh`,{position:[0,0,1.5],rotation:[-Math.PI/2,0,0],receiveShadow:!0,children:[(0,H.jsx)(`planeGeometry`,{args:pe}),e===`full`?(0,H.jsx)(F,{color:q,map:t,normalMap:n,normalScale:i,aoMap:r,roughnessMap:r,roughness:.55,metalness:.05,resolution:512,blur:[400,120],mixBlur:1,mixStrength:.45,mixContrast:1,mirror:0,depthScale:1.1,minDepthThreshold:.45,maxDepthThreshold:1.5}):(0,H.jsx)(`meshStandardMaterial`,{color:q,map:t,normalMap:n,normalScale:i,aoMap:r,roughnessMap:r,roughness:.5,metalness:.05})]})}function Ie({stacked:e,onReady:t}){let n=k.whole.accentColor;return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(b,{}),(0,H.jsx)(E,{intensity:.4}),(0,H.jsx)(Ce,{}),(0,H.jsx)(Pe,{}),(0,H.jsx)(Fe,{}),(0,H.jsxs)(`group`,{position:U,children:[(0,H.jsx)(T,{active:!1,revealed:!1,selectedStage:null,accent:n,onPick:()=>{},showMeter:!1}),(0,H.jsxs)(`mesh`,{position:[G,.02,f.center.z],castShadow:!0,receiveShadow:!0,children:[(0,H.jsx)(`boxGeometry`,{args:[.16,.04,.16]}),(0,H.jsx)(`meshStandardMaterial`,{color:9344154,roughness:.85,metalness:.05})]})]}),(0,H.jsx)(Se,{stacked:e}),(0,H.jsx)(re,{onReady:t})]})}function Le({running:e,onReady:t}){let{dpr:n}=A(),r=j(`(max-width: 900px)`);return(0,H.jsx)(a,{className:`hero-canvas`,frameloop:e?`always`:`never`,shadows:{type:1},dpr:[1,n],gl:{antialias:!0,alpha:!0,toneMapping:7,toneMappingExposure:1.1},camera:{fov:30,near:.1,far:60,position:[.85,1.55,2.35]},onCreated:({gl:e})=>{e.setClearColor(0,0),e.debug.checkShaderErrors=!1},children:(0,H.jsx)(P.Suspense,{fallback:null,children:(0,H.jsx)(Ie,{stacked:r,onReady:t})})})}export{Le as default};