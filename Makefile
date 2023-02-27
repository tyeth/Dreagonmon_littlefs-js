TARGET = lfs.js

CC = emcc
AR = ar
SIZE = size

SRC += $(wildcard *.c littlefs/*.c)
OBJ := $(SRC:.c=.o)
DEP := $(SRC:.c=.d)
ASM := $(SRC:.c=.s)

TEST := $(patsubst tests/%.sh,%,$(wildcard tests/test_*))

ifdef DEBUG
CFLAGS += -O0 -g3
else
CFLAGS += -Os
endif
ifdef WORD
CFLAGS += -m$(WORD)
endif
CFLAGS += -I. -Ilittlefs
CFLAGS += -std=c99 -Wall -pedantic
CFLAGS += -DLFS_MIGRATE
# CFLAGS += -DLFS_YES_TRACE

LFLAGS = --memory-init-file 0
LFLAGS += -sMODULARIZE=1
LFLAGS += -sEXPORT_ES6=1
LFLAGS += -sEXPORT_NAME="LFSM"
LFLAGS += -sALLOW_TABLE_GROWTH=1
LFLAGS += -sDYNAMIC_EXECUTION=0
LFLAGS += -sWASM=0
LFLAGS += -sSINGLE_FILE=1
LFLAGS += -sENVIRONMENT="shell"
LFLAGS += -sASYNCIFY
LFLAGS += -sEXPORTED_RUNTIME_METHODS="['cwrap','addFunction']"
LFLAGS += -sEXPORTED_FUNCTIONS="[ \
	'_lfs_format', \
	'_lfs_mount', \
	'_lfs_unmount', \
	'_lfs_remove', \
	'_lfs_rename', \
	'_lfs_stat', \
	'_lfs_file_open', \
	'_lfs_file_close', \
	'_lfs_file_sync', \
	'_lfs_file_read', \
	'_lfs_file_write', \
	'_lfs_file_seek', \
	'_lfs_file_truncate', \
	'_lfs_file_tell', \
	'_lfs_file_rewind', \
	'_lfs_file_size', \
	'_lfs_fs_traverse', \
	'_lfs_mkdir', \
	'_lfs_dir_open', \
	'_lfs_dir_close', \
	'_lfs_dir_read', \
	'_lfs_dir_seek', \
	'_lfs_dir_tell', \
	'_lfs_dir_rewind' \
]"


all: $(TARGET)

asm: $(ASM)

size: $(OBJ)
	$(SIZE) -t $^

.SUFFIXES:
test: test_format test_dirs test_files test_seek test_parallel \
	test_alloc test_paths test_orphan test_move test_corrupt
test_%: tests/test_%.sh
	./$<

-include $(DEP)

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) $^ $(LFLAGS) -o $@
	rm -f $(OBJ)
	rm -f $(DEP)
	rm -f $(ASM)

%.a: $(OBJ)
	$(AR) rcs $@ $^

%.o: %.c
	$(CC) -c -MMD $(CFLAGS) $< -o $@

%.s: %.c
	$(CC) -S $(CFLAGS) $< -o $@

clean:
	rm -f $(TARGET)
	rm -f $(OBJ)
	rm -f $(DEP)
	rm -f $(ASM)
