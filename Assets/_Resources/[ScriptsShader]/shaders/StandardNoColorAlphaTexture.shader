Shader "Wit/Standard(NoColorAlphaTexture)"  {
	Properties{



		_MainTex("Albedo (RGB)", 2D) = "white" {}
		_AlphaTex("Alpha (Greyscale)", 2D) = "white" {}
		_Glossiness("Smoothness", Range(0,1)) = 0.5
		_Shininess("Shininess", Range(0.03, 1)) = 0.078125
		_BumpMap("Normal map", 2D) = "bump" {}



		[HideInInspector]_LogLut("_LogLut", 2D) = "white" {}
	}
		SubShader{
			Tags {"Queue" = "Transparent" "RenderType" = "Transparent" }
			LOD 200

			CGPROGRAM
		// Physically based Standard lighting model, and enable shadows on all light types
		#pragma surface surf StandardSpecular alpha:fade finalcolor:tonemapping
		#include "/ToneMapping.cginc"

		// Use shader model 3.0 target, to get nicer looking lighting
		#pragma target 3.0

		sampler2D _MainTex;
		sampler2D _AlphaTex;
		sampler2D _BumpMap;
		sampler2D _SpecularTex;
		struct Input {
			float2 uv_MainTex;
			float2 uv_BumpMap;
			float2 uv_SpecularTex;
		};

		half _Glossiness;
		half _Shininess;


		void surf(Input IN, inout SurfaceOutputStandardSpecular o) {
			// Albedo comes from a texture tinted by color
			fixed4 c = tex2D(_MainTex, IN.uv_MainTex);

			o.Albedo = c.rgb;
			o.Smoothness = _Glossiness;
			o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
			o.Specular = _Shininess;
			o.Alpha = tex2D(_AlphaTex, IN.uv_MainTex).a;
		}

		void tonemapping(Input IN, SurfaceOutputStandardSpecular o, inout fixed4 color) {
			color = ApplyColorGrading(color);
		}
		ENDCG
	}
		FallBack "Wit/Standard(NoColor)"
}
