if (window.AFRAME == null) {
  console.error("aframe not found, please import it before this component.")
}

 AFRAME.registerSystem("track-cursor", {
    init: function() {
      this.el.setAttribute("cursor", { rayOrigin: "mouse" });
    }
  });
  
  AFRAME.registerComponent("track-cursor", {
    init: function() {
      this.el.addEventListener("mousedown", e => {
        if (this.el.is("cursor-hovered")) {
          this.el.sceneEl.camera.el.setAttribute("look-controls", {
            enabled: false
          });
          this.el.addState("dragging");
        }
      })
      this.el.addEventListener("click", e => {
        let elPos = this.el.attributes.position.value;
        let posValues = elPos.split(" ");
        let zPos = posValues[2];
        if (this.el.is("dragging")) {
          this.el.sceneEl.camera.el.setAttribute("look-controls", {
            enabled: true
          });
          this.el.removeState("dragging");
        }
      })
    },
  });
  
  AFRAME.registerComponent("dragndrop", {
    dependencies: ["track-cursor"],
    init: function() {
      this.range = 0;
      this.dist = 0;

      this.el.addEventListener("stateadded", e => {
    
        if (e.detail == "dragging") {
          this.range = 0.0;
          this.worldPos = new AFRAME.THREE.Vector3();
          this.el.parentEl.object3D.localToWorld(this.worldPos)
          
          this.dist = this.worldPos
            .clone()
            .sub(this.el.sceneEl.camera.el.object3D.position)
            .length();
        }
      })
  
      this.direction = new AFRAME.THREE.Vector3();
      this.target = new AFRAME.THREE.Vector3();
      document.addEventListener("wheel", e => {
        if (e.deltaY < 0) {
          this.range += 0.1;
        } else {
          this.range -= 0.1;
        }
      });
    },
    updateDirection: function() {
      this.direction.copy(this.el.sceneEl.getAttribute("raycaster").direction);
    },
    updateTarget: function() {
      let camera = this.el.sceneEl.camera.el;
      let elPos = this.el.attributes.position.value;
      let posValues = elPos.split(" ");
      let zPos = posValues[2];
      this.target.copy(
        camera.object3D.position
          .clone()
          .add(this.direction.clone().multiplyScalar((this.dist + this.range) * ((-1*zPos)-1) ))
      );
    },
    tick: function() {
      if (this.el.is("dragging")) {
        this.updateDirection();
        this.updateTarget();
        this.el.parentEl.object3D.worldToLocal(this.target);
        this.el.object3D.position.copy(this.target);
      }
    }
  });