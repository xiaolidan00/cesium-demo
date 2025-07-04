czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.diffuse = uColor.rgb;
    material.alpha = uColor.a;
    material.specular = 0.5;
    material.shininess = 0.8;
    material.emission = vec3(0.0, 0.66666666, 0.0);
    return material;
}