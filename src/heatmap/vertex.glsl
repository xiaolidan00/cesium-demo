in vec3 normal;
in vec2 st;
int sampler2D image;
out vec3 v_positionEC;
out vec3 v_normalEC;
out vec2 v_st;
out vec3 v_position;

        // The variables passed by appearance.uniforms need to be explicitly declared.
uniform float frameNumber;

void main() {
vec4 p = czm_computePosition();
p.xyz += texture2D(image, st) * normal;
            // Get the origin Model Coordinates (MC) from the position. This will lose some precision.
vec3 cameraPositionMC = czm_encodedCameraPositionMCHigh + czm_encodedCameraPositionMCLow;
vec3 originMC = p.xyz + cameraPositionMC;

v_position = originMC;

            // Restore to coordinates relative to the camera.
originMC = originMC - cameraPositionMC;
p.xyz = originMC;

v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
v_normalEC = czm_normal * normal;
v_st = st;

gl_Position = czm_modelViewProjectionRelativeToEye * p;
}