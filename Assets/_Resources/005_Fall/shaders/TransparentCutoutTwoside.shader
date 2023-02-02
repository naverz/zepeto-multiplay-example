// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Wit/TransparentCutoutTwoside" {
 Properties {
    _Color ("Main Color", Color) = (1, 1, 1, 1)
    _MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
    _Cutoff ("Base Alpha cutoff", Range (0,1.0)) = 1.0
 }
 

SubShader {
    Tags { "Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="TransparentCutout" }
    Lighting off
    Cull Off

        CGPROGRAM
            #pragma surface surf Lambert alphatest:_Cutoff

            sampler2D _MainTex;
            fixed4 _Color;

            struct Input{
                float2 uv_MainTex;
            };

            void surf (Input IN, inout SurfaceOutput o)
            {
               fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
               o.Emission = c.rgb;
               o.Alpha = c.a;
            }
        ENDCG
    }
    FallBack "Diffuse"
}