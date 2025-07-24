uniform vec4 color_2;
uniform vec2 repeat_1;
uniform sampler2D image_0;
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.diffuse = czm_gammaCorrect(texture(image_0, fract(repeat_1 * materialInput.st)).rgb * color_2.rgb);
    material.alpha = texture(image_0, fract(repeat_1 * materialInput.st)).a * color_2.a;
    return material;
}