uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying vec3 vPosition;

uniform float time;
uniform float heightMax;
uniform float heightMin;
uniform float waterLevel;
uniform float snowLevel;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

float mapLinear( float value, float min, float max, float a, float b ) {
    return ( ( b - a ) * ( value - min) ) / ( max - min ) + a;
}

vec3 colorFromHeight( float height ) {
    float waterLevelNormalized = mapLinear( waterLevel, heightMin, heightMax, 0.0, 1.0);
    float snowLevelNormalized = mapLinear( snowLevel, heightMin, heightMax, 0.0, 1.0);

    vec3 terrainColors[4];
    terrainColors[0] = vec3(0.0, 0.0, 0.8);
    terrainColors[1] = vec3(0.1, 0.3, 0.1);
    terrainColors[2] = vec3(0.4, 0.8, 0.4);
    terrainColors[3] = vec3(1.0, 1.0, 1.0);

    if (height < waterLevelNormalized) {
        float blendAmount = mapLinear( height, 0.0, waterLevelNormalized, 0.0, 0.3);
        return mix( terrainColors[0], terrainColors[1], blendAmount );
    } else if ( height < snowLevelNormalized ) {
        float blendAmount = mapLinear( height, waterLevelNormalized, snowLevelNormalized, 0.0, 1.0);
        return mix( terrainColors[1], terrainColors[2], blendAmount );
    } else  {
        float blendAmount = mapLinear( height, waterLevelNormalized, 1.0, 0.0, 1.0);
        return mix( terrainColors[2], terrainColors[3], blendAmount );
    }
}

void main() {
    #include <clipping_planes_fragment>

    float heightNormalized = mapLinear(vPosition.y, -5.0, 15.0, 0.0, 1.0 );
    vec3 terrainColor = colorFromHeight( heightNormalized );
    vec4 diffuseColor = vec4( terrainColor, 1.0 );

    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_fragment>
    #include <emissivemap_fragment>

    // accumulation
    #include <lights_phong_fragment>
    #include <lights_template>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

    #include <envmap_fragment>

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}
