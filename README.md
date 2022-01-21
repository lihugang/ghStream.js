# ghStream.js  
Using functions like the C language (stdio.h) to edit file on GitHub In JavaScript  
- - -  
functions:  
```javascript
fopen(Filename, Mode, ?gh_token)
fclose(fp)
freopen(filename, mode, stream, ?gh_token)
feof(stream)
retfgetpos(stream) -> fgetpos(stream,pos)
retfread(size, stream) -> fread(ptr, size, blocks, stream)
fseek(stream, offset, whence)
fsetpos(stream, pos)
ftell(stream)
easy_fwrite(ptr, stream) -> fwrite(ptr, size, blocks, stream)
remove(filename, ?gh_token)
rename(old_filename, new_filename, ?gh_token)
rewind(stream)
tmpfile()
tmpnam(dat)
getdata(stream)
setdata(stream, data)
```

