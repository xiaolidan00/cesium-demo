czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec4 tex = texture(image, materialInput.st);
    material.diffuse = tex.rgb;
    material.alpha = tex.a;
    // material.alpha = clamp(tex.a * 2.0, 0., 1.);
    // material.specular = 0.5;
    // material.shininess = 0.8;
    // material.emission = vec3(0.0, 0.66666666, 0.0);
    return material;
}