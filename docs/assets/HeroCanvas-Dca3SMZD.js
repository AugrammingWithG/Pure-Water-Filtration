import{C as e,O as t,T as n}from"./index-Cus8qXo3.js";import{$ as r,At as i,B as a,Ct as o,G as s,H as c,J as l,K as u,L as d,Mt as f,Nt as p,Ot as m,Q as ee,St as h,U as g,V as te,at as _,bt as v,d as y,dt as b,f as ne,ft as x,h as re,jt as S,kt as ie,lt as C,m as w,mt as T,q as E,t as D,u as O,vt as ae,xt as k,y as A,yt as oe,z as j}from"./WholeHouseUnit-CxTPAH7T.js";import{t as M}from"./useMediaQuery-8E122mmm.js";var N=parseInt(`186`.replace(/\D+/g,``)),P=class extends o{constructor(e=new i){super({uniforms:{inputBuffer:new m(null),depthBuffer:new m(null),resolution:new m(new i),texelSize:new m(new i),halfTexelSize:new m(new i),kernel:new m(0),scale:new m(1),cameraNear:new m(0),cameraFar:new m(1),minDepthThreshold:new m(0),maxDepthThreshold:new m(1),depthScale:new m(0),depthToBlurRatioBias:new m(.25)},fragmentShader:`#include <common>
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
          #include <${N>=154?`colorspace_fragment`:`encodings_fragment`}>
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
        }`,blending:0,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}},se=class{constructor({gl:e,resolution:t,width:n=500,height:r=500,minDepthThreshold:a=0,maxDepthThreshold:o=1,depthScale:c=0,depthToBlurRatioBias:l=.25}){this.renderToScreen=!1,this.renderTargetA=new p(t,t,{minFilter:C,magFilter:C,stencilBuffer:!1,depthBuffer:!1,type:_}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new P,this.convolutionMaterial.setTexelSize(1/n,1/r),this.convolutionMaterial.setResolution(new i(n,r)),this.scene=new h,this.camera=new E,this.convolutionMaterial.uniforms.minDepthThreshold.value=a,this.convolutionMaterial.uniforms.maxDepthThreshold.value=o,this.convolutionMaterial.uniforms.depthScale.value=c,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=l,this.convolutionMaterial.defines.USE_DEPTH=c>0;let d=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),f=new Float32Array([0,0,2,0,0,2]),m=new u;m.setAttribute(`position`,new s(d,3)),m.setAttribute(`uv`,new s(f,2)),this.screen=new x(m,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,n){let r=this.scene,i=this.camera,a=this.renderTargetA,o=this.renderTargetB,s=this.convolutionMaterial,c=s.uniforms;c.depthBuffer.value=t.depthTexture;let l=s.kernel,u=t,d,f,p;for(f=0,p=l.length-1;f<p;++f)d=f&1?o:a,c.kernel.value=l[f],c.inputBuffer.value=u.texture,e.setRenderTarget(d),e.render(r,i),u=d;c.kernel.value=l[f],c.inputBuffer.value=u.texture,e.setRenderTarget(this.renderToScreen?null:n),e.render(r,i)}},ce=class extends T{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;(t=e.defines)!=null&&t.USE_UV||(e.defines.USE_UV=``),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
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
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}},F=t(n()),I=F.forwardRef(({mixBlur:e=0,mixStrength:t=1,resolution:n=256,blur:i=[0,0],minDepthThreshold:a=.9,maxDepthThreshold:o=1,depthScale:s=0,depthToBlurRatioBias:l=.25,mirror:u=0,distortion:d=1,mixContrast:m=1,distortionMap:h,reflectorOffset:v=0,...y},ne)=>{te({MeshReflectorMaterialImpl:ce});let x=g(({gl:e})=>e),w=g(({camera:e})=>e),T=g(({scene:e})=>e);i=Array.isArray(i)?i:[i,i];let E=i[0]+i[1]>0,D=i[0],O=i[1],k=F.useRef(null);F.useImperativeHandle(ne,()=>k.current,[]);let[A]=F.useState(()=>new oe),[j]=F.useState(()=>new S),[M]=F.useState(()=>new S),[N]=F.useState(()=>new S),[P]=F.useState(()=>new b),[I]=F.useState(()=>new S(0,0,-1)),[L]=F.useState(()=>new f),[R]=F.useState(()=>new S),[z]=F.useState(()=>new S),[B]=F.useState(()=>new f),[V]=F.useState(()=>new b),[H]=F.useState(()=>new ae),U=F.useCallback(()=>{var e;let t=k.current.parent||((e=k.current)==null||(e=e.__r3f.parent)==null?void 0:e.object);if(!t||(M.setFromMatrixPosition(t.matrixWorld),N.setFromMatrixPosition(w.matrixWorld),P.extractRotation(t.matrixWorld),j.set(0,0,1),j.applyMatrix4(P),M.addScaledVector(j,v),R.subVectors(M,N),R.dot(j)>0))return;R.reflect(j).negate(),R.add(M),P.extractRotation(w.matrixWorld),I.set(0,0,-1),I.applyMatrix4(P),I.add(N),z.subVectors(M,I),z.reflect(j).negate(),z.add(M),H.position.copy(R),H.up.set(0,1,0),H.up.applyMatrix4(P),H.up.reflect(j),H.lookAt(z),H.far=w.far,H.updateMatrixWorld(),H.projectionMatrix.copy(w.projectionMatrix),V.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),V.multiply(H.projectionMatrix),V.multiply(H.matrixWorldInverse),V.multiply(t.matrixWorld),A.setFromNormalAndCoplanarPoint(j,M),A.applyMatrix4(H.matrixWorldInverse),L.set(A.normal.x,A.normal.y,A.normal.z,A.constant);let n=H.projectionMatrix;B.x=(Math.sign(L.x)+n.elements[8])/n.elements[0],B.y=(Math.sign(L.y)+n.elements[9])/n.elements[5],B.z=-1,B.w=(1+n.elements[10])/n.elements[14],L.multiplyScalar(2/L.dot(B)),n.elements[2]=L.x,n.elements[6]=L.y,n.elements[10]=L.z+1,n.elements[14]=L.w},[w,v]),[W,G,K,q]=F.useMemo(()=>{let i={minFilter:C,magFilter:C,type:_},c=new p(n,n,i);c.depthBuffer=!0,c.depthTexture=new r(n,n),c.depthTexture.format=ee,c.depthTexture.type=ie;let f=new p(n,n,i);return[c,f,new se({gl:x,resolution:n,width:D,height:O,minDepthThreshold:a,maxDepthThreshold:o,depthScale:s,depthToBlurRatioBias:l}),{mirror:u,textureMatrix:V,mixBlur:e,tDiffuse:c.texture,tDepth:c.depthTexture,tDiffuseBlur:f.texture,hasBlur:E,mixStrength:t,minDepthThreshold:a,maxDepthThreshold:o,depthScale:s,depthToBlurRatioBias:l,distortion:d,distortionMap:h,mixContrast:m,"defines-USE_BLUR":E?``:void 0,"defines-USE_DEPTH":s>0?``:void 0,"defines-USE_DISTORTION":h?``:void 0}]},[x,D,O,V,n,u,E,e,t,a,o,s,l,d,h,m]);return c(()=>{var e;let t=k.current.parent||((e=k.current)==null||(e=e.__r3f.parent)==null?void 0:e.object);if(!t)return;t.visible=!1;let n=x.xr.enabled,r=x.shadowMap.autoUpdate;U(),x.xr.enabled=!1,x.shadowMap.autoUpdate=!1,x.setRenderTarget(W),x.state.buffers.depth.setMask(!0),x.autoClear||x.clear(),x.render(T,H),E&&K.render(x,W,G),x.xr.enabled=n,x.shadowMap.autoUpdate=r,t.visible=!0,x.setRenderTarget(null)}),F.createElement(`meshReflectorMaterialImpl`,re({attach:`material`,key:`key`+q[`defines-USE_BLUR`]+q[`defines-USE_DEPTH`]+q[`defines-USE_DISTORTION`],ref:k},q,y))}),L=`/Pure-Water-Filtration/assets/white-stucco-diff-HSzhLxbm.webp`,R=`/Pure-Water-Filtration/assets/white-stucco-nor-ChDJd08X.webp`,z=`/Pure-Water-Filtration/assets/white-stucco-arm-CjkIuEj6.webp`,B=`/Pure-Water-Filtration/assets/brown-floor-tiles-diff-CXI7TELq.webp`,V=`/Pure-Water-Filtration/assets/brown-floor-tiles-nor-CKpRZ0V2.webp`,H=`/Pure-Water-Filtration/assets/brown-floor-tiles-arm-HkZmwyYx.webp`,U=e(),W=[-d.center.x,0,-d.center.z];d.depth/2;var G=-d.depth/2,K=d.riserX-d.center.x,q=G-.02,le=14934494,J=14211548,Y=[14,6],ue=2,X=1.6,Z=[14,10],de=1.7,fe=1,pe=16774114,me=13229042,he=12376063,ge=13820148,_e=11774620,ve={wide:{position:[.85,1.55,2.35],target:[-.35,1.15,0],fov:30},stacked:{position:[.35,1.5,2.75],target:[0,1.15,0],fov:34}};function ye({stacked:e}){let t=g(e=>e.camera),n=e?ve.stacked:ve.wide,r=(0,F.useRef)(new S),i=(0,F.useRef)(new S);return c(({clock:e})=>{r.current.set(...n.position),i.current.set(...n.target);let a=e.getElapsedTime(),o=Math.sin(a*.5)*.06,s=Math.sin(a*.35+1.2)*.03;t.position.set(r.current.x+o,r.current.y+s,r.current.z),t.fov!==n.fov&&(t.fov=n.fov,t.updateProjectionMatrix()),t.lookAt(i.current)}),null}function be(){let{shadowMap:e}=j();return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(`hemisphereLight`,{args:[me,_e,.5]}),(0,U.jsx)(`directionalLight`,{color:pe,intensity:4.4,position:[-3.2,3.4,2.6],castShadow:!0,"shadow-mapSize":[e,e],"shadow-bias":-4e-4,"shadow-normalBias":.02,"shadow-radius":6,"shadow-intensity":.92,"shadow-camera-left":-3,"shadow-camera-right":3,"shadow-camera-top":3,"shadow-camera-bottom":-2,"shadow-camera-near":1,"shadow-camera-far":10}),(0,U.jsx)(`directionalLight`,{color:ge,intensity:.85,position:[-3,1.6,2.4]}),(0,U.jsx)(`directionalLight`,{color:he,intensity:.45,position:[2.2,2.4,-1.6]})]})}function xe(e,t,n){let r=g(e=>e.gl),[i,a,o]=w(e);return(0,F.useMemo)(()=>{let e=Math.min(8,r.capabilities.getMaxAnisotropy()),s=(r,i)=>{let a=r.clone();return a.wrapS=v,a.wrapT=v,a.repeat.set(t[0]/n,t[1]/n),a.colorSpace=i,a.anisotropy=e,a.needsUpdate=!0,a};return{map:s(i,k),normalMap:s(a,``),armMap:s(o,``)}},[r,i,a,o,t,n])}var Se=[L,R,z],Ce=[B,V,H];function we(){return xe(Se,Y,ue)}function Te(){return xe(Ce,Z,de)}var Q=1.6,$=[1024,512],Ee=$[0]/Y[0];function De(e,t){return[(e+Y[0]/2)/Y[0]*$[0],(1-(t-Q+Y[1]/2)/Y[1])*$[1]]}var Oe=`rgba(130,140,160,1)`,ke=`rgba(150,158,174,1)`,Ae=.12,je=[{quad:[[-.76,1.72],[1.26,1.57],[1.36,.15],[-.68,.28]],brightness:1},{quad:[[-2.9,2.2],[-1.05,2.1],[-.98,1.55],[-2.85,1.62]],brightness:.82}];function Me(){return(0,F.useMemo)(()=>{let e=document.createElement(`canvas`);e.width=$[0],e.height=$[1];let t=e.getContext(`2d`);{let n=t.createLinearGradient(0,0,0,e.height);n.addColorStop(0,Oe),n.addColorStop(1,ke),t.fillStyle=n,t.fillRect(0,0,e.width,e.height)}t.save(),`filter`in t&&(t.filter=`blur(${Math.round(Ae*Ee)}px)`);for(let{quad:e,brightness:n}of je)t.beginPath(),e.forEach(([e,n],r)=>{let[i,a]=De(e,n);r===0?t.moveTo(i,a):t.lineTo(i,a)}),t.closePath(),t.fillStyle=`rgba(255,255,255,${n})`,t.fill();t.restore();{let e=7,n=()=>(e=e*16807%2147483647,e/2147483647);t.save(),t.globalCompositeOperation=`multiply`;for(let e=0;e<70;e++){let e=.7+n()*.9+n()*.6,r=.6+n()*1+n()*.5,i=(.12+n()*.22)*Ee,[a,o]=De(e,r),s=.3+n()*.25,c=t.createRadialGradient(a,o,0,a,o,i);c.addColorStop(0,`rgba(158,170,190,${s})`),c.addColorStop(.55,`rgba(158,170,190,${s*.7})`),c.addColorStop(1,`rgba(158,170,190,0)`),t.fillStyle=c,t.save(),t.translate(a,o),t.rotate(n()*Math.PI),t.scale(1,.45+n()*.5),t.translate(-a,-o),t.fillRect(a-i,o-i,i*2,i*2),t.restore()}t.restore()}let n=new l(e);return n.colorSpace=k,n},[])}function Ne(){let{map:e,normalMap:t,armMap:n}=we(),r=Me();return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsxs)(`mesh`,{position:[0,Q,q],receiveShadow:!0,children:[(0,U.jsx)(`planeGeometry`,{args:Y}),(0,U.jsx)(`meshStandardMaterial`,{color:le,map:e,normalMap:t,normalScale:[X,X],aoMap:n,roughnessMap:n,roughness:1,metalness:0})]}),(0,U.jsxs)(`mesh`,{position:[0,Q,q+.004],children:[(0,U.jsx)(`planeGeometry`,{args:Y}),(0,U.jsx)(`meshBasicMaterial`,{map:r,blending:4,premultipliedAlpha:!0,transparent:!0,depthWrite:!1,toneMapped:!1})]})]})}function Pe(){let{name:e}=j(),{map:t,normalMap:n,armMap:r}=Te(),i=[fe,fe];return(0,U.jsxs)(`mesh`,{position:[0,0,1.5],rotation:[-Math.PI/2,0,0],receiveShadow:!0,children:[(0,U.jsx)(`planeGeometry`,{args:Z}),e===`full`?(0,U.jsx)(I,{color:J,map:t,normalMap:n,normalScale:i,aoMap:r,roughnessMap:r,roughness:.55,metalness:.05,resolution:512,blur:[400,120],mixBlur:1,mixStrength:.45,mixContrast:1,mirror:0,depthScale:1.1,minDepthThreshold:.45,maxDepthThreshold:1.5}):(0,U.jsx)(`meshStandardMaterial`,{color:J,map:t,normalMap:n,normalScale:i,aoMap:r,roughnessMap:r,roughness:.5,metalness:.05})]})}function Fe({stacked:e,onReady:t}){let n=A.whole.accentColor;return(0,U.jsxs)(U.Fragment,{children:[(0,U.jsx)(y,{}),(0,U.jsx)(O,{intensity:.4}),(0,U.jsx)(be,{}),(0,U.jsx)(Ne,{}),(0,U.jsx)(Pe,{}),(0,U.jsxs)(`group`,{position:W,children:[(0,U.jsx)(D,{active:!1,revealed:!1,selectedStage:null,accent:n,onPick:()=>{},showMeter:!1}),(0,U.jsxs)(`mesh`,{position:[K,.02,d.center.z],castShadow:!0,receiveShadow:!0,children:[(0,U.jsx)(`boxGeometry`,{args:[.16,.04,.16]}),(0,U.jsx)(`meshStandardMaterial`,{color:9344154,roughness:.85,metalness:.05})]})]}),(0,U.jsx)(ye,{stacked:e}),(0,U.jsx)(ne,{onReady:t})]})}function Ie({running:e,onReady:t}){let{dpr:n}=j(),r=M(`(max-width: 900px)`);return(0,U.jsx)(a,{className:`hero-canvas`,frameloop:e?`always`:`never`,shadows:{type:1},dpr:[1,n],gl:{antialias:!0,alpha:!0,toneMapping:7,toneMappingExposure:1.1},camera:{fov:30,near:.1,far:60,position:[.85,1.55,2.35]},onCreated:({gl:e})=>{e.setClearColor(0,0),e.debug.checkShaderErrors=!1},children:(0,U.jsx)(F.Suspense,{fallback:null,children:(0,U.jsx)(Fe,{stacked:r,onReady:t})})})}export{Ie as default};