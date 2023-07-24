varying vec2 vUv;
uniform float resolution;
uniform sampler2D heightMap;
uniform float pole1Factor;
uniform vec3 pole1Coord;
uniform float pole2Factor;
uniform vec3 pole2Coord;
uniform float heightFactor;
uniform float iciness;
uniform int index;

vec3 getSphericalCoord(int index, float x, float y, float width) {
	width /= 2.0;
	x -= width;
	y -= width;
	vec3 coord = vec3(0.0, 0.0, 0.0);

	if (index == 0) {coord.x=width; coord.y=-y; coord.z=-x;}
	else if (index == 1) {coord.x=-width; coord.y=-y; coord.z=x;}
	else if (index == 2) {coord.x=x; coord.y=-width; coord.z=-y;}
	else if (index == 3) {coord.x=x; coord.y=width; coord.z=y;}
	else if (index == 4) {coord.x=x; coord.y=-y; coord.z=width;}
	else if (index == 5) {coord.x=-x; coord.y=-y; coord.z=-width;}

	return normalize(coord);
}

void main() {
	float x = vUv.x;
	float y = vUv.y;

	//float pixelSize = 1.0 / resolution;
    float height = texture2D(heightMap, vec2(x, y)).r;
    float heightEffect = pow(height, heightFactor);

    vec3 scoord = getSphericalCoord(index, x*resolution, y*resolution, resolution);
	//this could be better
    float poles =   pow((distance(scoord, pole1Coord))/1.414, pole1Factor)*
                    pow((distance(scoord, pole2Coord))/1.414, pole2Factor)*iciness;
    gl_FragColor = vec4(vec3(poles-heightEffect), 1.0);
}