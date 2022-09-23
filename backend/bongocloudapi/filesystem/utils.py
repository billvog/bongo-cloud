from .models import FilesystemItem

def filesystemitem_gen_path(item: FilesystemItem):
	path = ''
	if item.parent is not None:
		parent = item.parent
		while (parent is not None):
			path = '/' + parent.name + path
			parent = parent.parent

	path += '/' + item.name
	return path