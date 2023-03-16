using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Unity.EditorCoroutines.Editor;
using UnityEditor;
using UnityEngine;
using UnityEngine.Networking;


public class ZepetoModuleImporter : EditorWindow
{
    private Content _selectedData;
    private ContentList _contentList;
    private string _lastUpdateTime = "";

    private Language _selectedLanguage = Language.English;
    private readonly string[] _languages = Enum.GetNames(typeof(Language));
    private static EditorWindow _window;
    
    [MenuItem("ZEPETO/Module Importer")]
    public static void ShowWindow()
    {
        Rect windowRect = new Rect(0, 0, 800, 800);
        _window = EditorWindow.GetWindowWithRect(typeof(ZepetoModuleImporter), windowRect, true, "Zepeto Module Importer");
    }

    private void OnGUI()
    {
        if (!_window)
        {
            return;
        }
        
        if (_contentList == null)
        {
            _selectedLanguage =  Application.systemLanguage == SystemLanguage.Korean ? Language.Korean : Language.English;
            DoTopBarGUI();
            EditorCoroutineUtility.StartCoroutine(GetData(), this);
            GUILayout.BeginArea(new Rect(position.width * 0.5f, position.height * 0.5f, 400, 100));
            EditorGUILayout.BeginHorizontal();
            {
                GUILayout.Label("Wait...");
            }
            EditorGUILayout.EndHorizontal();
            GUILayout.EndArea();
        }

        else
        {
            DrawAll();
        }
    }

    private IEnumerator GetData()
    {
        UnityWebRequest www = UnityWebRequest.Get(ConstantManager.CONTENT_DATA_PATH);
        yield return www.SendWebRequest();

        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError(www.error);
        }
        else
        {
            if (_contentList == null)
            {
                _contentList = JsonUtility.FromJson<ContentList>(www.downloadHandler.text);
                _lastUpdateTime = DateTime.Now.ToString("HH:mm");
            }
        }
    }

    private void DrawAll()
    {
        DoTopBarGUI();
        GUILayout.BeginHorizontal();

        DoSideButtonGUI();

        if (_selectedData != null)
        {
            GUILayout.BeginVertical();

            DoTopButtonGUI();
            DoVersionInfoGUI();
            DoDescriptionGUI();
            DoDependencyInfoGUI();
            DoPreviewImageGUI();
            
            GUILayout.EndVertical();
        }

        GUILayout.EndHorizontal();
    }

    private void DoTopBarGUI()
    {
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));

        GUILayout.BeginHorizontal();

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.alignment = TextAnchor.MiddleLeft;
        labelStyle.fontSize = 24;

        GUILayout.Label("Zepeto Module Importer", labelStyle);
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));

        GUILayout.FlexibleSpace();
        _selectedLanguage =
            (Language)EditorGUILayout.Popup((int)_selectedLanguage, _languages, GUILayout.Width(150), GUILayout.Height(30));

        GUILayout.EndHorizontal();
        GUILayout.Label(" Easily add frequently used modules.", EditorStyles.label);

        GUILayout.Box("", GUILayout.Height(3), GUILayout.ExpandWidth(true));
    }

    private void DoSideButtonGUI()
    {
        const int buttonWidth = 200;
        GUILayout.BeginVertical(GUILayout.Width(buttonWidth));
        if (_selectedData == null)
            _selectedData = _contentList.Items[0] ?? null;
        
        foreach (Content data in _contentList.Items)
        {
            if (GUILayout.Button("", GUILayout.Width(buttonWidth), GUILayout.Height(30)))
            {
                _selectedData = data;
            }

            Rect guiRect = GUILayoutUtility.GetLastRect();
            Rect titleRect = new Rect(guiRect.x + (guiRect.width * 0.05f), guiRect.y, guiRect.width, guiRect.height);
            Rect versionRect = new Rect(guiRect.x + (guiRect.width * 0.77f), guiRect.y, guiRect.width, guiRect.height);
            Rect satusRect = new Rect(guiRect.x + (guiRect.width * 0.9f), guiRect.y, guiRect.width, guiRect.height);

            GUI.Label(titleRect, data.Title);
            string version = VersionHandler.VersionCheck(GetRemoveSpace(data.Title) + "Version");
            if (version != "UNKNOWN")
            {
                GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
                GUI.Label(versionRect, version, EditorStyles.miniLabel);
                Texture2D statusTexture = version == data.LatestVersion
                    ? EditorGUIUtility.FindTexture("d_winbtn_mac_max")
                    : EditorGUIUtility.FindTexture("d_winbtn_mac_min");
                GUI.Label(satusRect, statusTexture);
            }
        }
        DoUpdateButtonGUI();

        GUILayout.EndVertical();
        GUILayout.Box("", GUILayout.ExpandHeight(true), GUILayout.Width(3));
    }

    private void DoUpdateButtonGUI()
    {
        GUILayout.BeginHorizontal();
        
        GUILayout.FlexibleSpace();
        GUILayout.Label("Last Update : " + _lastUpdateTime, EditorStyles.boldLabel, GUILayout.Height(30));
        if (GUILayout.Button(EditorGUIUtility.FindTexture("d_Refresh"), GUILayout.Width(30), GUILayout.Height(30)))
        {
            _contentList = null;
            EditorCoroutineUtility.StartCoroutine(GetData(), this);
        }

        GUILayout.EndHorizontal();
    }


    private void DoTopButtonGUI()
    {
        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.alignment = TextAnchor.MiddleLeft;
        labelStyle.fontSize = 20;
        labelStyle.fontStyle = FontStyle.Bold;

        GUILayout.BeginHorizontal();
        GUILayout.Label(_selectedData.Title, labelStyle);
        GUILayout.FlexibleSpace();

        if (GUILayout.Button("View Import Guide", GUILayout.Height(20), GUILayout.ExpandWidth(false)))
        {
            string url = Path.Combine(ConstantManager.REPO_PATH, GetRemoveSpace(_selectedData.Title), _selectedLanguage == Language.Korean ? "README_KR.md" : "README.md");
            Application.OpenURL(url);
        }

        if (GUILayout.Button("Import " + _selectedData.LatestVersion, GUILayout.Height(20),
                GUILayout.ExpandWidth(false)))
        {
            string title = GetRemoveSpace(_selectedData.Title);
            string version = "v"+_selectedData.LatestVersion;
            EditorCoroutineUtility.StartCoroutine(ImportHandler.ImportPackage(title, version), this);
        }

        GUILayout.EndHorizontal();

        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoVersionInfoGUI()
    {
        string className = GetRemoveSpace(_selectedData.Title) + "Version";
        string downloadedVersion = VersionHandler.VersionCheck(className);

        GUILayout.Label($"Version : {downloadedVersion}", EditorStyles.boldLabel);

        GUIStyle linkStyle = new GUIStyle(GUI.skin.label);
        linkStyle.normal.textColor = new Color(0.0f, 0.47f, 1.0f);
        linkStyle.hover.textColor = Color.yellow;
        linkStyle.fontStyle = FontStyle.Italic;

        GUILayout.BeginHorizontal();

        if (GUILayout.Button("See other version", linkStyle))
        {
            string versionUrl = Path.Combine(ConstantManager.REPO_PATH, GetRemoveSpace(_selectedData.Title));
            Application.OpenURL(versionUrl);
        }

        GUILayout.Label("-");
        if (GUILayout.Button("API Docs", linkStyle))
        {
            string docsUrl = _selectedData.DocsUrl;
            if(_selectedLanguage == Language.Korean)
                docsUrl = Regex.Replace(docsUrl, "lang-en", "lang-ko");
            
            Application.OpenURL(_selectedData.DocsUrl);
        }

        GUILayout.FlexibleSpace();

        GUILayout.EndHorizontal();

        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoDependencyInfoGUI()
    {
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
        GUILayout.Label("Dependencies", EditorStyles.boldLabel);
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
        GUILayout.Label("Is Using", EditorStyles.boldLabel);

        GUILayout.BeginVertical();
        foreach (string dependency in _selectedData.Dependencies)
        {
            GUILayout.Label("\t" + dependency, EditorStyles.label);
        }

        GUILayout.EndVertical();

        
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoDescriptionGUI()
    {        
        GUIStyle style = new GUIStyle();
        style.wordWrap = true;
        style.normal.textColor = Color.white; 
        
        GUILayout.Label(_selectedLanguage == 0 ? _selectedData.Description : _selectedData.Description_ko, style);
        
    }

    private void DoPreviewImageGUI()
    {
        GUILayout.Label("Preview",EditorStyles.boldLabel);

        string imagePath = Application.dataPath + ConstantManager.IMAGE_PATH + _selectedData.Title +
                           ConstantManager.EXTENSION_PNG;
        if (File.Exists(imagePath))
        {
            Texture2D image = new Texture2D(2, 2);
            image.LoadImage(File.ReadAllBytes(imagePath));

            float maxWidth = 550;
            float maxHeight = 400f;
            float imageWidth = Mathf.Min(image.width, maxWidth);
            float imageHeight = Mathf.Min(image.height, maxHeight);

            GUILayout.Box(image, GUILayout.Width(imageWidth), GUILayout.Height(imageHeight));
        }
    }

    private string GetRemoveSpace(string s)
    {
        return s.Replace(" ", "");
    }

    [System.Serializable]
    public class Content
    {
        public string Title;
        public string Description;
        public string Description_ko;
        public string DocsUrl;
        public string LatestVersion;
        public string[] Dependencies;
    }

    [System.Serializable]
    public class ContentList
    {
        public List<Content> Items;
    }

    public enum Language
    {
        English = 0,
        Korean = 1
    }
}