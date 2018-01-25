import { ShaderChunk } from 'three';

export default {
    vertex: vertex(),
    fragment: fragment(),
};

function vertex(): string {
    return `
#define LAMBERT
varying vec3 vLightFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
#endif
${ShaderChunk.common}
${ShaderChunk.uv_pars_vertex}
${ShaderChunk.uv2_pars_vertex}
${ShaderChunk.envmap_pars_vertex}
${ShaderChunk.bsdfs}
${ShaderChunk.lights_pars}
${ShaderChunk.color_pars_vertex}
${ShaderChunk.fog_pars_vertex}
${ShaderChunk.morphtarget_pars_vertex}
${ShaderChunk.skinning_pars_vertex}
${ShaderChunk.shadowmap_pars_vertex}
${ShaderChunk.logdepthbuf_pars_vertex}
${ShaderChunk.clipping_planes_pars_vertex}
void main() {
	${ShaderChunk.uv_vertex}
	${ShaderChunk.uv2_vertex}
	${ShaderChunk.color_vertex}
	${ShaderChunk.beginnormal_vertex}
	${ShaderChunk.morphnormal_vertex}
	${ShaderChunk.skinbase_vertex}
	${ShaderChunk.skinnormal_vertex}
	${ShaderChunk.defaultnormal_vertex}
	${ShaderChunk.begin_vertex}
	${ShaderChunk.morphtarget_vertex}
	${ShaderChunk.skinning_vertex}
	${ShaderChunk.project_vertex}
	${ShaderChunk.logdepthbuf_vertex}
	${ShaderChunk.clipping_planes_vertex}
	${ShaderChunk.worldpos_vertex}
	${ShaderChunk.envmap_vertex}
	${ShaderChunk.lights_lambert_vertex}
	${ShaderChunk.shadowmap_vertex}
	${ShaderChunk.fog_vertex}
}
        `;
}

function fragment(): string {
    return `
uniform float time;
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
#ifdef DOUBLE_SIDED
    varying vec3 vLightBack;
#endif
${ShaderChunk.common}
${ShaderChunk.packing}
${ShaderChunk.dithering_pars_fragment}
${ShaderChunk.color_pars_fragment}
${ShaderChunk.uv_pars_fragment}
${ShaderChunk.uv2_pars_fragment}
${ShaderChunk.map_pars_fragment}
${ShaderChunk.alphamap_pars_fragment}
${ShaderChunk.aomap_pars_fragment}
${ShaderChunk.lightmap_pars_fragment}
${ShaderChunk.emissivemap_pars_fragment}
${ShaderChunk.envmap_pars_fragment}
${ShaderChunk.bsdfs}
${ShaderChunk.lights_pars}
${ShaderChunk.fog_pars_fragment}
${ShaderChunk.shadowmap_pars_fragment}
${ShaderChunk.shadowmask_pars_fragment}
${ShaderChunk.specularmap_pars_fragment}
${ShaderChunk.logdepthbuf_pars_fragment}
${ShaderChunk.clipping_planes_pars_fragment}
void main() {
    ${ShaderChunk.clipping_planes_fragment}
    vec4 diffuseColor = vec4(
        diffuse.x * sin( time ) * 0.5 + 0.5,
        diffuse.y,
        diffuse.z * sin( time + 1.0 ) * 0.5 + 0.5,
    	opacity
    );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    ${ShaderChunk.logdepthbuf_fragment}
    ${ShaderChunk.map_fragment}
    ${ShaderChunk.color_fragment}
    ${ShaderChunk.alphamap_fragment}
    ${ShaderChunk.alphatest_fragment}
    ${ShaderChunk.specularmap_fragment}
    ${ShaderChunk.emissivemap_fragment}
    reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
    ${ShaderChunk.lightmap_fragment}
    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
    #ifdef DOUBLE_SIDED
        reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
    #else
        reflectedLight.directDiffuse = vLightFront;
    #endif
    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
    ${ShaderChunk.aomap_fragment}
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
    ${ShaderChunk.envmap_fragment}
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    ${ShaderChunk.tonemapping_fragment}
    ${ShaderChunk.encodings_fragment}
    ${ShaderChunk.fog_fragment}
    ${ShaderChunk.premultiplied_alpha_fragment}
    ${ShaderChunk.dithering_fragment}
}
    `;
}
