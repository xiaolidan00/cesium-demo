uniform vec4 color_2;
uniform vec2 repeat_1;

uniform sampler2D image_0;
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec4 tex = texture(image_0, materialInput.st);
    material.diffuse = tex.rgb;
    material.alpha = tex.a * 2.0;
    return material;
}