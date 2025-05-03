type InfoType = {
  id: string | undefined;
};

class Hash {
  info(): InfoType {
    const hash = location.hash.split("/");
    return { id: hash[1] };
  }

  setInfo(info: InfoType) {
    location.hash = "#!/" + info.id;
  }

  isLooking(id: string | undefined) {
    return id !== undefined && id === this.info().id;
  }

  toggleLookingFor(id: string | undefined) {
    const info = { id: this.isLooking(id) ? "" : id };
    this.setInfo(info);
  }
}

export default new Hash();
