// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Upgrade NOTE: commented out 'float4 unity_LightmapST', a built-in variable
// Upgrade NOTE: replaced tex2D unity_Lightmap with UNITY_SAMPLE_TEX2D

Shader "Background_JY/Ground_Splatting_LightMap"
{
	Properties {
		_SplatterMap ("SplatterMap", 2D) = "white"{}
		_Splat1 ("Texture 1 (R)", 2D) = "white"{}
		_Splat2 ("Texture 2 (G)", 2D) = "white"{}
		_Splat3 ("Texture 3 (B)", 2D) = "white"{}
		_Splat4 ("Texture 4 (A)", 2D) = "white"{}
		_MainColor ("Main Color", Color) = (1,1,1,1)
		_ShadingColor ("ShadingColor", Color) = (0.5,0.5,0.5,1)
        _ShadingValue ("ShadingValue", Range(0, 5)) = 1.837606
		_ShadowColor ("Shadow Color", Color) = (0.8, 0.8, 1, 1)
	}


	SubShader
	{
		Tags { "Queue"="Background" "RenderType"="Opaque" }
		LOD 150
		AlphaTest Off
		Cull Back
	
		Pass
		{
			Tags 
			{ 
				"LightMode" = "ForwardBase"
			}

			Lighting On

			CGPROGRAM
			#pragma multi_compile_fwdbase
			#pragma vertex vert
			#pragma fragment frag
     		#pragma target 3.0

			#include "UnityCG.cginc"
			#include "AutoLight.cginc"

			sampler2D _SplatterMap;
			sampler2D _Splat1;
			sampler2D _Splat2;
			sampler2D _Splat3;
			sampler2D _Splat4;
			float4 _MainColor;
			float4 _ShadowColor;

			uniform float4 _SplatterMap_ST;
			uniform float4 _Splat1_ST;
			uniform float4 _Splat2_ST;
			uniform float4 _Splat3_ST;
			uniform float4 _Splat4_ST;
			uniform float _ShadingValue;
            uniform float4 _ShadingColor;
		
			struct a2v 
			{
				float4 vertex : POSITION;
				float3 normal : NORMAL;
				float2 texcoord : TEXCOORD0;
				float2 texcoord1 : TEXCOORD1;
			};

			struct v2f 
			{
				float4 pos : SV_POSITION;
				float2 uv : TEXCOORD0;
				float viewAmount : TEXCOORD1; // x : snow y : rim
				float2 lightmapUV : TEXCOORD2;
				LIGHTING_COORDS(3,4)
			};

			v2f vert(a2v v) 
			{
				v2f o;
				o.pos = UnityObjectToClipPos(v.vertex);
				o.uv = v.texcoord;
				float3 normalDir = UnityObjectToWorldNormal(v.normal);
				float3 posWorld = mul(unity_ObjectToWorld, v.vertex).xyz;
				float3 viewDir = normalize(_WorldSpaceCameraPos.xyz - posWorld);
				o.viewAmount = dot(normalDir, viewDir);
				o.lightmapUV = v.texcoord1.xy * unity_LightmapST.xy + unity_LightmapST.zw;
				TRANSFER_VERTEX_TO_FRAGMENT(o);
		
				return o;
			}

			half4 frag(v2f IN) : COLOR 
			{
				half4 FinalColor;

				float4 splat_control = tex2D(_SplatterMap, IN.uv);

				//TRANSFORM_TEX(v.texcoord, _Splat4);
				float4 Splat1 = tex2D(_Splat1, TRANSFORM_TEX(IN.uv, _Splat1));
				float4 Splat2 = tex2D(_Splat2, TRANSFORM_TEX(IN.uv, _Splat2));
				float4 Splat3 = tex2D(_Splat3, TRANSFORM_TEX(IN.uv, _Splat3));
				float4 Splat4 = tex2D(_Splat4, TRANSFORM_TEX(IN.uv, _Splat4));
			
				// diffuse color
				fixed3 albedo;
				albedo = Splat1.rgb * splat_control.r;
				albedo += Splat2.rgb * splat_control.g;
				albedo += Splat3.rgb * splat_control.b;
				albedo += Splat4.rgb * splat_control.a;

				half atten = LIGHT_ATTENUATION(IN);

				FinalColor.rgb = saturate(_ShadingColor.rgb + (1.0 - pow(1.0 - max(0, IN.viewAmount), _ShadingValue))) * albedo * _MainColor.rgb;
				FinalColor.a = 1.0f;

				FinalColor.rgb *= (DecodeLightmap(UNITY_SAMPLE_TEX2D(unity_Lightmap, IN.lightmapUV)).rgb) ;

				float3 shadowColor = _ShadowColor.rgb * FinalColor.rgb;
				float  attenuation = saturate( 2.0 * atten - 1.0 );

				FinalColor.rgb = lerp( shadowColor, FinalColor, atten );

				return FinalColor;
			}

			ENDCG
		}

		Pass
		{
			Name "FORWARD_DELTA"

			Tags 
			{ 
				"LightMode" = "ForwardAdd"
			}

			Lighting On
			Blend One One

			CGPROGRAM
			#pragma multi_compile_fwdadd
			#pragma multi_compile_fwdadd_fullshadows
			#pragma vertex vert
			#pragma fragment frag
     		#pragma target 3.0

			#include "UnityCG.cginc"
			#include "AutoLight.cginc"
            #include "UnityPBSLighting.cginc"
            #include "UnityStandardBRDF.cginc"

		
			struct a2v 
			{
				float4 vertex : POSITION;
				float3 normal : NORMAL;
				float2 texcoord : TEXCOORD0;
			};

			struct v2f 
			{
				float4 pos : SV_POSITION;
				float2 uv : TEXCOORD0;
				float3 normal : TEXCOORD1;
				float3 posWorld : TEXCOORD2;
				LIGHTING_COORDS(3,4)
			};

			v2f vert(a2v v) 
			{
				v2f o;
				o.pos = UnityObjectToClipPos(v.vertex);
				o.uv = v.texcoord;
				o.normal = UnityObjectToWorldNormal(v.normal);
				o.posWorld = mul(unity_ObjectToWorld, v.vertex).xyz;
				TRANSFER_VERTEX_TO_FRAGMENT(o);
		
				return o;
			}

			half4 frag(v2f IN) : COLOR 
			{
				float3 normalDirection = normalize(IN.normal);
				float3 lightDirection = normalize(_WorldSpaceLightPos0.xyz);
				
				if( _WorldSpaceLightPos0.w != 0)	//포인트 라이트
				{
					 lightDirection = normalize( _WorldSpaceLightPos0.xyz - IN.posWorld);
				}

                float3 lightColor = _LightColor0.rgb;
				float	NdotL = saturate(dot(normalDirection, lightDirection));

				float attenuation = LIGHT_ATTENUATION(IN);// / PointLightLength;

				return half4(_LightColor0.rgb * NdotL * attenuation, 1);
			}

			ENDCG
		}

	}

	Fallback "VertexLit"
}
