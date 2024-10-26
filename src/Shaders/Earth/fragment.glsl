uniform float uTime;
uniform float uClouds;
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereNightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation
    float sunOrientation = dot(uSunDirection, normal);

    // Day / night color
    float dayMix = smoothstep(- 0.25, 0.5, sunOrientation);
    vec3 dayTexture = texture(uDayTexture, vUv).rgb;
    vec3 nightTexture = texture(uNightTexture, vUv).rgb;
    color = mix(nightTexture, dayTexture, dayMix);

    // Clouds
    vec2 animatedUv = vUv + vec2(uTime * 0.009, 0.0); 
    vec2 specularCloudsTexture = texture(uCloudsTexture, animatedUv).rg;

    float cloudsMix = smoothstep(uClouds, 1.0, specularCloudsTexture.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix);


    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 5.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereNightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * uAtmosphereDayColor);

    // Specular
    vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 25.0);
    specular *= specularCloudsTexture.r;

    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}