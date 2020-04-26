# frozen_string_literal: true

require 'fileutils'

SNAPSHOTS_DIR = '/backup/snapshots'
# Rake tasks adapted from https://gist.github.com/hopsoft/56ba6f55fe48ad7f8b90

namespace :debug do
    desc 'Snapshots the db and saves to db/snapshots/{timestamp}_tapp_{environment}.psql'
    task :snapshot do
        # make sure the snapshots directory exists before we attempt to save to it
        FileUtils.mkdir_p SNAPSHOTS_DIR
        cmd = nil
        with_config do |app, host, db, user, pass|
            timestamp = Time.now.strftime('%Y_%m_%d__%H_%M_%S')
            file_name = "#{SNAPSHOTS_DIR}/#{timestamp}_#{db}.psql"
            con_string = "postgresql://#{user}:#{pass}@#{host}:5432/#{db}"
            cmd = "pg_dump --clean -F c -v -f #{file_name} #{con_string}"
            puts cmd
        end
        `#{cmd}`
    end

    desc 'Restores the database from the last snapshot'
    task :restore do
        cmd = nil
        with_config do |app, host, db, user, pass|
            last_snapshot_file = `cd #{SNAPSHOTS_DIR} && ls | tail -n 1`
            if last_snapshot_file.blank?
                puts 'There is no snapshot to restore from.'
                return
            else
                file_name = "#{SNAPSHOTS_DIR}/#{last_snapshot_file}"
                con_string = "postgresql://#{user}:#{pass}@#{host}:5432/#{db}"
                # -j 4    specifies use 4 threads to write simultaneously
                # -a      specifies to only add data and not recreate the schema
                # The -a option saves a lot of time. The `-c -C` options,
                # in theory would clear the database before restoring. However, they fail
                # if there is an active connection, which there always is with rails running.
                # Therefore we compromize.
                #
                # XXX: You must clear_data before restoring a snapshot
                # to get the database back to its original state.
                cmd = "pg_restore -j 4 -d #{con_string} -a #{file_name}"
            end
        end
        ActiveRecord::Tasks::DatabaseTasks.drop_all
        ActiveRecord::Tasks::DatabaseTasks.create_all
        Rails.logger.info "Running command to restore databse: #{cmd}"
        `#{cmd}`
        db_config = ActiveRecord::Base.configurations[Rails.env]
        ActiveRecord::Base.establish_connection(db_config)
        ActiveRecord::Tasks::DatabaseTasks.migrate
    end
end

private

def with_config
    yield Rails.application.class.module_parent_name
        .underscore, ActiveRecord::Base.connection_config[
        :host
    ], ActiveRecord::Base.connection_config[:database], ActiveRecord::Base
        .connection_config[
        :username
    ], ActiveRecord::Base.connection_config[:password]
end
