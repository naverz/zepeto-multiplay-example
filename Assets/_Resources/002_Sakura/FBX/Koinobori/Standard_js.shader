Shader "Wit/Standard_js" {
	Properties {
		_Color ("Color", Color) = (1, 1, 1, 1)
		_MainTex ("Albedo (RGB)", 2D) = "white" {}
		
		[Header(Base Spec)]
		_Glossiness ("Glossiness", Range(0,1)) = 0.5
		_Shininess ("Shininess", Range(0,1)) = 0.0
		_SpecularColor ("SpecColor", Color) = (1, 1, 1, 1)
		[Space][Space][Space][Space][Space]
		
		
		[Toggle]_Active ("Second Spec", Range(0, 1)) = 0
		[Header(uv.X2)]
		_Glossiness2 ("Glossiness2", Range(0,1)) = 0.5
		_Shininess2 ("Shininess2", Range(0,1)) = 0.0
		_SpecularColor2 ("SpecColor2", Color) = (1, 1, 1, 1)
		[Space][Space][Space][Space][Space]		
		
		[Header(uv.Y2)]
		[NOScaleOffset]_BumpMap ("NormalMap", 2D) = "bump"{}
		_NormalTiling("NormalTiling", range(1, 50)) = 1
		_NormalPower("NormalPower", range(0,3)) = 1
		[Space][Space][Space][Space][Space]	
		
		[Header(uv.Y3)]
        //sparkle variables
		_SparkleTex("Sequin Texture", 2D) = "black" {} //the noise texture
		_SparkleColor("SequinColor", Color) = (1,1,1,1) //color of the sparkle effect
		_SparkleRange("SequinRange", range(0.1, 10)) = 0.1 //range of the sparkle effect
		_Intensity("Intensity", range(0.1, 30)) = 1 //intensity of the sparkle effect
		
		[Space][Space][Space][Space][Space]
        //rim lighting variables
        _RimColor("RimColor", Color) = (1,1,1,1) //color of rim lighting
        _RimPower("RimPower", Float) = 1 //intensity of rim lighting

		[HideInInspector]_LogLut ("_LogLut", 2D)  = "white" {}

	}
	SubShader {
		Tags { "RenderType" = "Opaque"  "Queue" = "Geometry" }
		LOD 200

		CGPROGRAM
		#pragma surface surf StandardSpecular finalcolor:tonemapping
		#include "ToneMapping.cginc"

		#pragma target 3.0


		sampler2D _MainTex;
		sampler2D _BumpMap;

		//sparkle variables
        sampler2D _SparkleTex;
        float _SparkleRange, _Intensity;
        half4 _SparkleColor;

        //rim lighting variables
        half4 _RimColor;
        float _RimPower;

		struct Input {
			float2 uv_MainTex;
			float2 uv_BumpMap;
			float2 uv_SparkleTex;

			float3 viewDir;
			float3 worldNormal; INTERNAL_DATA
		};

		half _Glossiness, _Glossiness2, _Shininess, _Shininess2;
		fixed4 _Color;
		fixed4 _SpecularColor;
		fixed4 _SpecularColor2;
		fixed _NormalPower, _Active, _NormalTiling;



		void surf (Input IN, inout SurfaceOutputStandardSpecular o) {
			// Albedo comes from a texture tinted by color
			fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
						
			//sparkel effect
			fixed3 sparklemap = tex2D(_SparkleTex, IN.uv_SparkleTex);
			sparklemap -= half3(0.1, 0.8, 0.1);
			sparklemap = normalize(sparklemap);
			half sparkle = step(2, IN.uv_MainTex.y) * (pow(saturate((dot(IN.viewDir * float3(_SparkleRange, 0, _SparkleRange), normalize(sparklemap + IN.worldNormal)))), _Intensity));
			
			//Metallic and smoothness come from slider variables
			o.Specular = (_Shininess * (1 - (step(1, IN.uv_MainTex.x) * _Active)) * _SpecularColor) + (_Shininess2 * (step(1, IN.uv_MainTex.x) * _Active) * _SpecularColor2);
			o.Smoothness = (_Glossiness * (1 - (step(1, IN.uv_MainTex.x) * _Active))) + (_Glossiness2 * (step(1, IN.uv_MainTex.x) * _Active));
			fixed3 nm = UnpackNormal(tex2D(_BumpMap, fixed2(IN.uv_MainTex.x * _NormalTiling, IN.uv_MainTex.y * _NormalTiling)));
			o.Normal = ((nm * fixed3(_NormalPower, _NormalPower, 1)) * step(1, IN.uv_MainTex.y)) + ((nm * fixed3(0, 0, 1)) * (1 - step(1, IN.uv_MainTex.y)));
			
			
			//rim lighting
			float rim = dot(o.Normal, IN.viewDir);
			
			o.Albedo = c.rgb;
			o.Emission = (max(0, (pow(1 - rim, _RimPower) * _RimColor.rgb)) + (_SparkleColor * sparkle * smoothstep(0, 1, pow(rim, _RimPower - 0.05)))) * step(1, IN.uv_MainTex.y);
			o.Alpha = c.a;
		}

		void tonemapping (Input IN, SurfaceOutputStandardSpecular o, inout fixed4 color) {
        	color = ApplyColorGrading(color);			
    	}		
		ENDCG
	}
	FallBack "Diffuse"
}
