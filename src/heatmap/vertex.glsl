in vec3 position3DHigh;
in vec3 position3DLow;
in vec3 normal;
in vec2 st;

uniform sampler2D image_0;
in float batchId;

out vec3 v_positionEC;
out vec3 v_normalEC;
out vec2 v_st;

void main() {
        vec4 p = czm_computePosition();

        v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
        v_normalEC = czm_normal * normal;                         // normal in eye coordinates
        v_st = st;
        //贴图颜色
        vec4 tex = texture(image_0, st);
        //原始点坐标
        vec4 orgPos = czm_inverseModelView * p;
        //起伏高度
        p.xyz += tex.a * 5000.0 * normalize(orgPos.xyz);
        gl_Position = czm_modelViewProjectionRelativeToEye * p;
}