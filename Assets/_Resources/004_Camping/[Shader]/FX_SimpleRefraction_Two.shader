// Made with Amplify Shader Editor
// Available at the Unity Asset Store - http://u3d.as/y3X 
Shader "Particle/FX_SimpleRefraction_Two"
{
	Properties
	{
		_Refraction_Texture("Refraction_Texture", 2D) = "bump" {}
		_Refraction("Refraction", Range( 0 , 2)) = 0.292
		_Mask("Mask", 2D) = "white" {}
		[Toggle]_Use_CustomData("Use_CustomData", Float) = 0
		_Ref_U_Panning("Ref_U_Panning", Float) = 0
		_Ref_V_Panning("Ref_V_Panning", Float) = -0.2
		_Ref_U_Tiling("Ref_U_Tiling", Float) = 1
		_Ref_V_Tiling("Ref_V_Tiling", Float) = 1
		[HideInInspector] _texcoord( "", 2D ) = "white" {}
		[HideInInspector] __dirty( "", Int ) = 1
	}

	SubShader
	{
		Tags{ "RenderType" = "Transparent"  "Queue" = "AlphaTest+0" "IsEmissive" = "true"  }
		Cull Off
		ZWrite Off
		Blend SrcAlpha OneMinusSrcAlpha , SrcAlpha OneMinusSrcAlpha
		
		GrabPass{ }
		CGPROGRAM
		#include "UnityShaderVariables.cginc"
		#pragma target 2.0
		#if defined(UNITY_STEREO_INSTANCING_ENABLED) || defined(UNITY_STEREO_MULTIVIEW_ENABLED)
		#define ASE_DECLARE_SCREENSPACE_TEXTURE(tex) UNITY_DECLARE_SCREENSPACE_TEXTURE(tex);
		#else
		#define ASE_DECLARE_SCREENSPACE_TEXTURE(tex) UNITY_DECLARE_SCREENSPACE_TEXTURE(tex)
		#endif
		#pragma surface surf Unlit keepalpha noshadow 
		struct Input
		{
			float4 screenPos;
			float2 uv_texcoord;
			float4 vertexColor : COLOR;
		};

		ASE_DECLARE_SCREENSPACE_TEXTURE( _GrabTexture )
		uniform sampler2D _Mask;
		uniform float4 _Mask_ST;
		uniform sampler2D _Refraction_Texture;
		uniform float _Ref_U_Tiling;
		uniform float _Ref_V_Tiling;
		uniform float _Ref_U_Panning;
		uniform float _Ref_V_Panning;
		uniform float _Use_CustomData;
		uniform float _Refraction;


		inline float4 ASE_ComputeGrabScreenPos( float4 pos )
		{
			#if UNITY_UV_STARTS_AT_TOP
			float scale = -1.0;
			#else
			float scale = 1.0;
			#endif
			float4 o = pos;
			o.y = pos.w * 0.5f;
			o.y = ( pos.y - o.y ) * _ProjectionParams.x * scale + o.y;
			return o;
		}


		inline half4 LightingUnlit( SurfaceOutput s, half3 lightDir, half atten )
		{
			return half4 ( 0, 0, 0, s.Alpha );
		}

		void surf( Input i , inout SurfaceOutput o )
		{
			float4 ase_screenPos = float4( i.screenPos.xyz , i.screenPos.w + 0.00000000001 );
			float4 ase_grabScreenPos = ASE_ComputeGrabScreenPos( ase_screenPos );
			float4 ase_grabScreenPosNorm = ase_grabScreenPos / ase_grabScreenPos.w;
			float2 uv_Mask = i.uv_texcoord * _Mask_ST.xy + _Mask_ST.zw;
			float4 appendResult54 = (float4(_Ref_U_Tiling , _Ref_V_Tiling , 0.0 , 0.0));
			float4 appendResult50 = (float4(_Ref_U_Panning , _Ref_V_Panning , 0.0 , 0.0));
			float2 panner55 = ( _Time.y * appendResult50.xy + float2( 0,0 ));
			float2 uv_TexCoord56 = i.uv_texcoord * appendResult54.xy + panner55;
			float4 screenColor8 = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_GrabTexture,( float3( (ase_grabScreenPosNorm).xy ,  0.0 ) + (( tex2D( _Mask, uv_Mask ) * float4( ( UnpackNormal( tex2D( _Refraction_Texture, uv_TexCoord56 ) ) * (( _Use_CustomData )?( i.uv_texcoord.x ):( _Refraction )) ) , 0.0 ) )).rga ).xy);
			o.Emission = screenColor8.rgb;
			o.Alpha = ( screenColor8.a * i.vertexColor.a );
		}

		ENDCG
	}
	CustomEditor "ASEMaterialInspector"
}
/*ASEBEGIN
Version=18800
36;188;1624;752;889.8879;107.1858;1;True;True
Node;AmplifyShaderEditor.RangedFloatNode;48;-2485.012,-8.893079;Float;False;Property;_Ref_U_Panning;Ref_U_Panning;5;0;Create;True;0;0;0;False;0;False;0;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;49;-2485.012,231.1069;Float;False;Property;_Ref_V_Panning;Ref_V_Panning;6;0;Create;True;0;0;0;False;0;False;-0.2;0.2;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;53;-1941.012,39.10691;Float;False;Property;_Ref_V_Tiling;Ref_V_Tiling;8;0;Create;True;0;0;0;False;0;False;1;0.5;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;52;-1957.012,-216.8931;Float;False;Property;_Ref_U_Tiling;Ref_U_Tiling;7;0;Create;True;0;0;0;False;0;False;1;1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.DynamicAppendNode;50;-2213.011,103.1069;Inherit;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.SimpleTimeNode;51;-2197.011,343.1068;Inherit;False;1;0;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.DynamicAppendNode;54;-1717.012,-88.89307;Inherit;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.PannerNode;55;-1957.012,183.1069;Inherit;False;3;0;FLOAT2;0,0;False;2;FLOAT2;0,0;False;1;FLOAT;1;False;1;FLOAT2;0
Node;AmplifyShaderEditor.RangedFloatNode;31;-1394.988,384.6783;Float;False;Property;_Refraction;Refraction;2;0;Create;True;0;0;0;False;0;False;0.292;0;0;2;0;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;56;-1465.746,117.3325;Inherit;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.TextureCoordinatesNode;46;-1378.988,512.6783;Inherit;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SamplerNode;29;-1108.073,179.1634;Inherit;True;Property;_Refraction_Texture;Refraction_Texture;1;0;Create;True;0;0;0;False;0;False;-1;None;None;True;0;True;bump;Auto;True;Object;-1;Auto;Texture2D;8;0;SAMPLER2D;0,0;False;1;FLOAT2;0,0;False;2;FLOAT;1;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;6;FLOAT;0;False;7;SAMPLERSTATE;;False;5;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ToggleSwitchNode;47;-1067.297,403.598;Float;False;Property;_Use_CustomData;Use_CustomData;4;0;Create;True;0;0;0;False;0;False;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;32;-743.7755,240.8217;Inherit;False;2;2;0;FLOAT3;0,0,0;False;1;FLOAT;0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.SamplerNode;42;-921.2724,-60.18816;Inherit;True;Property;_Mask;Mask;3;0;Create;True;0;0;0;False;0;False;-1;None;None;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;8;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;6;FLOAT;0;False;7;SAMPLERSTATE;;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;41;-553.0175,231.8348;Inherit;False;2;2;0;COLOR;0,0,0,0;False;1;FLOAT3;0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.GrabScreenPosition;40;-470.6786,-24.47536;Inherit;False;0;0;5;FLOAT4;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ComponentMaskNode;36;-248.5805,285.0987;Inherit;False;True;True;False;True;1;0;COLOR;0,0,0,0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.ComponentMaskNode;39;-191.7806,65.19897;Inherit;False;True;True;False;False;1;0;FLOAT4;0,0,0,0;False;1;FLOAT2;0
Node;AmplifyShaderEditor.SimpleAddOpNode;30;36.62508,137.2995;Inherit;False;2;2;0;FLOAT2;0,0;False;1;FLOAT3;0,0,0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.VertexColorNode;44;-7.417097,330.851;Inherit;False;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ScreenColorNode;8;220.0004,84.8997;Float;False;Global;_ScreenGrab0;Screen Grab 0;-1;0;Create;True;0;0;0;False;0;False;Object;-1;False;False;1;0;FLOAT2;0,0;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;45;278.5183,356.1106;Inherit;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.StandardSurfaceOutputNode;0;536.7999,-33.8;Float;False;True;-1;0;ASEMaterialInspector;0;0;Unlit;Particle/FX_SimpleRefraction_Two;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;Off;2;False;-1;0;False;-1;False;0;False;-1;0;False;-1;False;0;Custom;0.5;True;False;0;True;Transparent;;AlphaTest;All;14;all;True;True;True;True;0;False;-1;False;0;False;-1;255;False;-1;255;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;False;0;4;10;25;False;0.5;False;2;5;False;-1;10;False;-1;2;5;False;-1;10;False;-1;0;False;-1;0;False;-1;0;False;0;0,0,0,0;VertexOffset;True;False;Cylindrical;False;Relative;0;;0;-1;-1;-1;0;False;0;0;False;-1;-1;0;False;-1;0;0;0;False;0.1;False;-1;0;False;-1;False;15;0;FLOAT3;0,0,0;False;1;FLOAT3;0,0,0;False;2;FLOAT3;0,0,0;False;3;FLOAT;0;False;4;FLOAT;0;False;6;FLOAT3;0,0,0;False;7;FLOAT3;0,0,0;False;8;FLOAT;0;False;9;FLOAT;0;False;10;FLOAT;0;False;13;FLOAT3;0,0,0;False;11;FLOAT3;0,0,0;False;12;FLOAT3;0,0,0;False;14;FLOAT4;0,0,0,0;False;15;FLOAT3;0,0,0;False;0
WireConnection;50;0;48;0
WireConnection;50;1;49;0
WireConnection;54;0;52;0
WireConnection;54;1;53;0
WireConnection;55;2;50;0
WireConnection;55;1;51;0
WireConnection;56;0;54;0
WireConnection;56;1;55;0
WireConnection;29;1;56;0
WireConnection;47;0;31;0
WireConnection;47;1;46;1
WireConnection;32;0;29;0
WireConnection;32;1;47;0
WireConnection;41;0;42;0
WireConnection;41;1;32;0
WireConnection;36;0;41;0
WireConnection;39;0;40;0
WireConnection;30;0;39;0
WireConnection;30;1;36;0
WireConnection;8;0;30;0
WireConnection;45;0;8;4
WireConnection;45;1;44;4
WireConnection;0;2;8;0
WireConnection;0;9;45;0
ASEEND*/
//CHKSM=37DBEB0A249E4BCD2E1FC03E0D95973169CCA1EC