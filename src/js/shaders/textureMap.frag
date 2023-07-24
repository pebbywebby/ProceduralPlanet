import noise from 'glsl-noise/classic/4d'

varying vec2 vUv;

uniform sampler2D biomeMap;
uniform sampler2D heightMap;
uniform sampler2D moistureMap;
uniform sampler2D temperatureMap;
uniform float iceCutoff;   //this is bugged for some reason I can't understand

void main() {
	float x = vUv.x;
	float y = vUv.y;

	float temp = texture2D(temperatureMap, vec2(x,y)).r;

	float n1 = texture2D(heightMap, vec2(x, y)).r;
	float n2 = texture2D(moistureMap, vec2(x, y)).r;

	vec4 color = texture2D(biomeMap, vec2(n2, n1));

	// if (n1 < 0.5) {
	// 	vec4 water = vec4(0.0, 0.4, 0.9, 1.0);
	// 	// vec4 water = vec4(1.0, 0.2, 0.0, 1.0);
	// 	color = mix(water, color, 0.3);
	// }
  //
	// if (n1 < 0.5 && n1 > 0.4) {
	// 	vec4 coast = vec4(vec3(1.0), 1.0);
	// 	float amount = 1.0 - ((0.5 - n1) * 10.0);
	// 	color = mix(color, coast, amount*0.3);
	// }

	// color = vec4(1.0);

	if(temp < 0.1) //temporary fix
		gl_FragColor = vec4(1.0);
	else
		gl_FragColor = color;
}
