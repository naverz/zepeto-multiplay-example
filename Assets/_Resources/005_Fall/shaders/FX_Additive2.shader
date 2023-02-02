// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "FX/FX_Additive2"
{
	Properties
	{
		_MainTex ("Particle Texture", 2D) = "white" {}
		_SubTex ("Sub (RGB)", 2D) = "white" {}
		_TintColor ("Tint Color", Color) = (1.0, 1.0, 1.0, 1.0)
		_Multiplier ("Color Multiplier", Float) = 1.0
		_InitUOffset ("Initial U Offset", Float) = 0.0		
		_InitVOffset ("Initial V Offset", Float) = 0.0		
		_InitRotate ("Initial Rotate", Float) = 0.0
		_InitScale ("Initial Scale", Float) = 1.0		
		_USpeed ("U Speed", Float) = 0.0
		_VSpeed ("V Speed", Float) = 0.0
		_RotateSpeed ("Rotate Speed", Float) = 0.0
		_ScaleSpeed ("Scale Speed", Float) = 0.0
		_InitUOffset2 ("Initial U Offset2", Float) = 0.0		
		_InitVOffset2 ("Initial V Offset2", Float) = 0.0		
		_InitRotate2 ("Initial Rotate2", Float) = 0.0
		_InitScale2 ("Initial Scale2", Float) = 1.0		
		_USpeed2 ("U Speed2", Float) = 0.0
		_VSpeed2 ("V Speed2", Float) = 0.0
		_RotateSpeed2 ("Rotate Speed2", Float) = 0.0
		_ScaleSpeed2 ("Scale Speed2", Float) = 0.0
		_ShowSecondOnly ("Show Second Texture Only", Float) = 0
	}
		
	SubShader
	{
		Tags {"Queue" = "Transparent" }
		
		Pass
		{
			Fog { Mode Off }
			Lighting Off
			Blend SrcAlpha One
			Cull Off
			ZWrite Off
			
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag			
			#include "UnityCG.cginc"
			
			sampler2D _MainTex;
			float4 _MainTex_ST;
			sampler2D _SubTex;
			float4 _SubTex_ST;
			
			float4 _TintColor;
			float _Multiplier;
			float _InitUOffset;
			float _InitVOffset;
			float _InitRotate;
			float _InitScale;
			float _USpeed;
			float _VSpeed;
			float _RotateSpeed;
			float _ScaleSpeed;
			float _InitUOffset2;
			float _InitVOffset2;
			float _InitRotate2;
			float _InitScale2;
			float _USpeed2;
			float _VSpeed2;
			float _RotateSpeed2;
			float _ScaleSpeed2;
			int _ShowSecondOnly;
			
			struct vertexInput
			{
				float4 vertex : POSITION;
				float4 vertexcolor : COLOR0;
				float2 texcoord0 : TEXCOORD0;
			};

			struct fragmentInput
			{
				float4 position : SV_POSITION;
				float4 vertexcolor : COLOR0;
				float2 texcoord0 : TEXCOORD0;
				float2 texcoord1 : TEXCOORD1;
			};
			

			fragmentInput vert(vertexInput i)
			{
				fragmentInput o;
				o.position = UnityObjectToClipPos (i.vertex);
				
				//
				float2 uv = TRANSFORM_TEX(i.texcoord0.xy, _MainTex);				
				float2 center = TRANSFORM_TEX(float2(0.5f, 0.5f), _MainTex);
				float deg2rad = 3.141592f / 180.0f;
				
				float2 _uv = uv - center;
				
				float scale = 1.0f / (_InitScale + _ScaleSpeed * _Time.y);
				_uv = _uv * scale;

				float rotate = _InitRotate * deg2rad + _RotateSpeed * deg2rad * _Time.y;
				float _cos = cos(rotate);
				float _sin = sin(rotate);

				uv.x = (_uv.x * _cos) - (_uv.y * _sin);
				uv.y = (_uv.x * _sin) + (_uv.y * _cos);				
				uv = center + uv;
								
				float uoffset = _USpeed * _Time.y + _InitUOffset;
				float voffset = _VSpeed * _Time.y + _InitVOffset;
				uv.x = uv.x + uoffset;
				uv.y = uv.y + voffset;				
				
				o.texcoord0 = uv;

				//
				float2 uv2 = TRANSFORM_TEX(i.texcoord0.xy, _SubTex);				
				float2 center2 = TRANSFORM_TEX(float2(0.5f, 0.5f), _SubTex);
				
				_uv = uv2 - center2;
				
				scale = 1.0f / (_InitScale2 + _ScaleSpeed2 * _Time.y);
				_uv = _uv * scale;
				
				rotate = _InitRotate2 * deg2rad + _RotateSpeed2 * deg2rad * _Time.y;
				_cos = cos(rotate);
				_sin = sin(rotate);

				uv2.x = (_uv.x * _cos) - (_uv.y * _sin);
				uv2.y = (_uv.x * _sin) + (_uv.y * _cos);				
				uv2 = center2 + uv2;
								
				uoffset = _USpeed2 * _Time.y + _InitUOffset2;
				voffset = _VSpeed2 * _Time.y + _InitVOffset2;
				uv2.x = uv2.x + uoffset;
				uv2.y = uv2.y + voffset;				
				
				//
				o.texcoord1 = uv2;
				
				//
				o.vertexcolor = i.vertexcolor;

				//
				return o;
			}

			float4 frag(fragmentInput i) : COLOR
			{
			#if defined(SHADER_API_D3D9)		// window(editor)에서만 동작하도록..
				float4 mainTexColor;
				if(_ShowSecondOnly == 1) 
					mainTexColor = float4(1.0f, 1.0f, 1.0f, 1.0f);
				else
					mainTexColor = tex2D(_MainTex, i.texcoord0);
			#else
				float4 mainTexColor = tex2D(_MainTex, i.texcoord0);
			#endif
				float4 subTexColor = tex2D(_SubTex, i.texcoord1);
				
				float4 color = mainTexColor * subTexColor * _TintColor * i.vertexcolor;
				color = saturate(color * _Multiplier);
			
				return color;
			}
			ENDCG
		}
	}
}