using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// Rotate planet around y-axis with speed.
public class SpinPlanet : MonoBehaviour {
  public float speed = 4;
	
	void Update () {
    transform.Rotate(Vector3.up, speed * Time.deltaTime);
	}
}
